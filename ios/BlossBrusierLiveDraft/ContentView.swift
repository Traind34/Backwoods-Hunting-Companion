import SwiftUI

struct ContentView: View {
    @StateObject private var draft = LiveDraftManager()
    @State private var leagueID = ""
    @State private var draftSlot = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Bloss Brusier") {
                    Text("Live Draft Companion")
                        .font(.title2.bold())
                    Text("Keep ESPN open. The Dynamic Island will show the recommendation without requiring you to switch apps.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Section("Draft") {
                    TextField("ESPN League ID", text: $leagueID)
                        .keyboardType(.numberPad)
                    TextField("Your draft slot (1–12)", text: $draftSlot)
                        .keyboardType(.numberPad)

                    Button(draft.isRunning ? "Live Activity Running" : "Start Draft Assistant") {
                        guard let slot = Int(draftSlot), (1...12).contains(slot), !leagueID.isEmpty else { return }
                        draft.start(leagueId: leagueID, slot: slot)
                    }
                    .disabled(draft.isRunning)

                    Button("Stop Live Activity", role: .destructive) {
                        draft.stop()
                    }
                    .disabled(!draft.isRunning)
                }

                Section("Connection") {
                    Label(draft.registrationStatus, systemImage: draft.isRunning ? "antenna.radiowaves.left.and.right" : "circle")
                }

                Section("Current recommendation") {
                    Text(draft.lastPlayer)
                        .font(.headline)
                }

                Section {
                    Text("ESPN authentication is intentionally not collected here. The Backwoods server uses server-side ESPN credentials; never enter an ESPN password or session cookie into this app.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Draft War Room")
        }
    }
}
