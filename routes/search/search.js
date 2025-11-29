const express = require("express")
const router = express.Router()

const User = require("../../models/user")
const Organization = require("../../models/organization")
const UserProfile = require("../../models/user_profile")
const OrganizationProfile = require("../../models/organize_profile")
const authToken = require('../../middleware/authToken')



// Unified Search: Users + Organizations
router.post("/search", authToken, async (req, res) => {
    try {
        const {
            keyword,
            tab, // "all", "individual", "organization"
            skills,
            certifications,
            industry,
            country,
            state,
            city,
        } = req.body


        // -----------------------------
        // BUILD USER QUERY
        // -----------------------------
        const userQuery = {}

        if (keyword) {
            // keyword searches firstname, lastname in User and professional_bio.about in UserProfile
            userQuery.$or = [
                { "firstname": { $regex: keyword, $options: "i" } },
                { "lastname": { $regex: keyword, $options: "i" } },
                { "professional_bio.about": { $regex: keyword, $options: "i" } },
            ]
        }

        if (skills && skills.length > 0) {
            userQuery.skills = { $in: skills }
        }

        if (certifications && certifications.length > 0) {
            userQuery.certifications = { $in: certifications }
        }

        if (industry) userQuery.industry = industry
        if (country) userQuery["professional_bio.country"] = country
        if (state) userQuery["professional_bio.state"] = state
        if (city) userQuery["professional_bio.city"] = city


        // -----------------------------
        // BUILD ORGANIZATION QUERY
        // -----------------------------
        const orgQuery = {}

        if (keyword) {
            // keyword searches company_name in Organization and company_bio.about in OrganizationProfile
            orgQuery.$or = [
                { company_name: { $regex: keyword, $options: "i" } },
                { "company_bio.about": { $regex: keyword, $options: "i" } },
            ]
        }

        if (industry) orgQuery["company_bio.industry"] = industry
        if (country) orgQuery["company_location.country"] = country
        if (state) orgQuery["company_location.state"] = state
        if (city) orgQuery["company_location.city"] = city


        // -----------------------------
        // EXECUTE BASED ON TAB SELECTION
        // -----------------------------
        let users = []
        let organizations = []

        if (tab === "individual") {
            users = await UserProfile.find(userQuery)
            .populate("user_id", "firstname lastname") // populate names from User model
            .sort({ createdAt: -1 })
        } else if (tab === "organization") {
            organizations = await OrganizationProfile.find(orgQuery)
            .populate("organization_id", "company_name") // populate company_name
            .sort({ createdAt: -1 })
        } else {
            // "all" tab
            users = await UserProfile.find(userQuery)
            .populate("user_id", "firstname lastname")
            .sort({ createdAt: -1 })
            organizations = await OrganizationProfile.find(orgQuery)
            .populate("organization_id", "company_name")
            .sort({ createdAt: -1 })
        }

        // -----------------------------
        // RETURN RESULTS
        // -----------------------------
       return res.status(200).send({ status: "ok", msg: "success", tab, totalUsers: users.length,
            totalOrganizations: organizations.length, users, organizations,
        })
    } catch (err) {
        console.error("Search Error:", err)
        return res.status(500).send({ status: "error", msg: "Error occurred", error: err.message })
    }
})

module.exports = router