package org.jetbrains.research.ictl.riskypatterns.calculation

object BusFactorConstants {

    const val shift: Double = 3.293
    const val ownershipSlope: Double = 1.098
    const val commitsSlope: Double = 0.164
    const val otherCommitsSlope: Double = 0.321
    const val reviewsSlope: Double = 0.082
    const val otherReviewsSlope: Double = 0.160
    const val meetingsSlope: Double = 0.164

    // One week (in milliseconds) before the commit the author starts telling people what they are writing
    const val discussionStart: Int = 604800000

    // One week (in milliseconds) after the commit the author stops telling people what they are writing
    const val discussionEnd: Int = 604800000
    const val milliSecondsInMinute: Int = 60000

    // no matter how much time one spends at meetings, one probably won't learn about the commit
    // more than the original commit author
    const val maxEffectiveTimeAtMeetings: Double = 240.0

    const val authorshipThreshold: Double = 3.293 // threshold #1 for author to be considered significant contributor
    const val normalizedAuthorshipThreshold: Double =
        0.75 // threshold #2 for author to be considered significant contributor
    const val authorshipThresholdNew: Double = 0.001
    const val decayCharacteristicTime: Int = 90

    const val authorshipSlopeNew: Double = 3.0
    const val reviewsSlopeNew: Double = 0.5
    const val meetingsSlopeNew: Double = 1.0
    const val commitsSlopeNew: Double = 1.0
    const val otherCommitsSlopeNew: Double = 2.4
    const val otherReviewsSlopeNew: Double = 1.2

    const val newFormula: Boolean = true
    const val daysGap: Long = 547
}
