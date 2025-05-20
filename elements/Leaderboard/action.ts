export const fetchExternalUrl = async (id: string) => {
    const URLEXTERNAL_ID = `https://st-admapi.onaim.io/api/Builder/GetPromotionForBuilder?id=${id}`;
    try {
        const response = await fetch(URLEXTERNAL_ID);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
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
        const response = await fetch(LEADERBOARD_URL, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        throw error;
    }
};
