// Middleware 1: Only KIP users can post opportunites (whether jobs, scholarships or trainings)
const canPostOpportunities = async (req, res, next) => {
    const user = req.user._id // could be individual user or organization
    if (!user) {
        return res.status(401).send({ status: 'error', msg: 'Unauthorized' })
    }

    if (!user.is_kip || user.status !== 'Active') {
        return res.status(403).send({ status: 'error', msg: 'Only active KIP members can post opportunities' })
    }
    next() // User (individual or organization ) is allowed to post
}

modules.exports = { canPostOpportunities }