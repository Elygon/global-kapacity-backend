const getDateFromPeriod = (period) => {
    const now = new Date()

    switch (period) {
        case "all":
            return null; // No filter needed
        case "last_24_hours":
            return new Date(now.getTime() - 24 * 60 * 60 * 1000)
        case "last_3_days":
            return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
        case "last_7_days":
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        case "last_14_days":
            return new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        case "last_30_days":
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        case "over_1_month":
            return "over_1_month" // special case handled in endpoint
        default:
            return null // fallback to no filter
    }
}

module.exports = { getDateFromPeriod }