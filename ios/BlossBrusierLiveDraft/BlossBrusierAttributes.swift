import ActivityKit

struct BlossBrusierAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var status: String
        var player: String
        var position: String
        var confidence: Int
        var overallPick: Int
        var isUserPick: Bool
    }

    var leagueName: String
}
