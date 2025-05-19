import axios from "axios"


export const fetchExternalUrl = async (id:string) => {
    const URLEXTERNAL_ID = `https://st-admapi.onaim.io/api/Builder/GetPromotionForBuilder?id=${id}`
    try {
        const response = await axios.get(URLEXTERNAL_ID);
        const data = response.data;
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

export const leaderboardData = async (promotionId: string, externalId: string) => {
    const LEADERBOARD_URL = `https://st-apigateway.onaim.io/leaderboardapi/LeaderboardProgress/GetLeaderboardProgressForUser?ExternalId=${externalId}&promotionId=${promotionId}`;
    try {
        const response = await axios.get(LEADERBOARD_URL, {
            headers: {
                "Content-Type": "application/json",
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        throw error;
    }
};
