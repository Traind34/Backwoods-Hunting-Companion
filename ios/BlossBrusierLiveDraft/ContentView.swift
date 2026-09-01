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
                        draft.start()
                    }
                    .disabled(draft.isRunning)

                    Button("Stop Live Activity", role: .destructive) {
                        draft.stop()
                    }
                    .disabled(!draft.isRunning)
                }

                Section("Current recommendation") {
                    Text(draft.lastPlayer)
                        .font(.headline)
                }

                Section {
                    Text("ESPN authentication is intentionally not collected here. The app will use the Backwoods server-side draft feed once private-league authentication is configured securely.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Draft War Room")
        }
    }
}
