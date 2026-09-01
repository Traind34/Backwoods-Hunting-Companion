import ActivityKit
import Foundation

@MainActor
final class LiveDraftManager: ObservableObject {
    @Published var isRunning = false
    @Published var lastPlayer = "Waiting for draft"

    private var activity: Activity<BlossBrusierAttributes>?

    func start(leagueName: String = "Bloss Brusier") {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }
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
                    content: .init(state: state, staleDate: nil),
                    pushType: nil
                )
                isRunning = true
            } catch {
                print("Unable to start Live Activity: \(error)")
            }
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
            await activity.update(.init(state: state, staleDate: nil))
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
