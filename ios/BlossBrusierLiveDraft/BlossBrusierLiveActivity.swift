import ActivityKit
import WidgetKit
import SwiftUI

struct BlossBrusierLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: BlossBrusierAttributes.self) { context in
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(context.state.isUserPick ? "TAKE NOW" : "BLOSS BRUSIER")
                        .font(.caption2.bold())
                    Text(context.state.player)
                        .font(.title3.bold())
                    Text("\(context.state.position) • \(context.state.confidence)% confidence")
                        .font(.caption)
                }
                Spacer()
                Text(context.state.isUserPick ? "🟢" : "🏈")
                    .font(.title)
            }
            .padding()
            .activityBackgroundTint(.black)
            .activitySystemActionForegroundColor(.white)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(context.state.isUserPick ? "TAKE" : "NEXT")
                        .font(.caption.bold())
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(context.state.player)
                        .font(.headline.bold())
                        .lineLimit(1)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.position)
                        .font(.caption.bold())
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Text(context.state.isUserPick ? "🟢 YOUR PICK" : "Waiting for your pick")
                            .font(.caption.bold())
                        Spacer()
                        Text("\(context.state.confidence)%")
                            .font(.caption.bold())
                    }
                }
            } compactLeading: {
                Text(context.state.isUserPick ? "🟢" : "🏈")
            } compactTrailing: {
                Text(context.state.player)
                    .font(.caption2.bold())
                    .lineLimit(1)
            } minimal: {
                Text(context.state.isUserPick ? "🟢" : "🏈")
            }
        }
    }
}

@main
struct BlossBrusierLiveActivityBundle: WidgetBundle {
    var body: some Widget {
        BlossBrusierLiveActivity()
    }
}
