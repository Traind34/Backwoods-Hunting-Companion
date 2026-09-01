import ActivityKit
import Foundation

@MainActor
final class LiveDraftManager: ObservableObject {
    @Published var isRunning = false
    @Published var lastPlayer = "Waiting for draft"
    @Published var registrationStatus = "Not registered"

    private var activity: Activity<BlossBrusierAttributes>?
    private let backend = URL(string: "https://backwoods-hunting-companion-rjq8.vercel.app")!

    func start(leagueId: String, slot: Int, season: Int = 2026, leagueName: String = "Bloss Brusier") {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            registrationStatus = "Live Activities are disabled"
            return
        }
        let attributes = BlossBrusierAttributes(leagueName: leagueName)
        let state = BlossBrusierAttributes.ContentState(
            status: "Waiting",
            player: "Waiting for draft",
            position: "—",
            confidence: 0,
            overallPick: 0,
            isUserPick: false
        )

        Task {
            do {
                activity = try Activity.request(
                    attributes: attributes,
                    content: .init(state: state, staleDate: Date().addingTimeInterval(120)),
                    pushType: .token
                )
                isRunning = true
                registrationStatus = "Live Activity started"
                await registerPushToken(leagueId: leagueId, slot: slot, season: season)
            } catch {
                registrationStatus = "Unable to start: \(error.localizedDescription)"
            }
        }
    }

    private func registerPushToken(leagueId: String, slot: Int, season: Int) async {
        guard let activity else { return }
        for await tokenData in activity.pushTokenUpdates {
            let token = tokenData.map { String(format: "%02x", $0) }.joined()
            let deviceId = UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString
            let body: [String: Any] = [
                "deviceId": deviceId,
                "pushToken": token,
                "leagueId": leagueId,
                "season": season,
                "slot": slot
            ]
            guard let url = URL(string: backend.absoluteString + "/api/live-token") else { return }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
            do {
                let (_, response) = try await URLSession.shared.data(for: request)
                if let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) {
                    registrationStatus = "Push channel registered"
                } else {
                    registrationStatus = "Push registration failed"
                }
            } catch {
                registrationStatus = "Push registration unavailable"
            }
            break
        }
    }

    func update(player: String, position: String, confidence: Int, overallPick: Int, isUserPick: Bool) {
        guard let activity else { return }
        let state = BlossBrusierAttributes.ContentState(
            status: isUserPick ? "Your Pick" : "Drafting",
            player: player,
            position: position,
            confidence: confidence,
            overallPick: overallPick,
            isUserPick: isUserPick
        )
        lastPlayer = player
        Task {
            await activity.update(.init(state: state, staleDate: Date().addingTimeInterval(120)))
        }
    }

    func stop() {
        guard let activity else { return }
        Task {
            await activity.end(nil, dismissalPolicy: .immediate)
            self.activity = nil
            self.isRunning = false
        }
    }
}
