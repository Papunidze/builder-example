import React, {useEffect, useState} from "react";
import styles from "./leaderboard.module.scss";
import { fetchExternalUrl, leaderboardData } from "./action";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

export interface LeaderboardProps {
  title?: string;
}

interface ApiPlayerEntry {
  playerUsername: string;
  amount: number;
}

interface LeaderboardApiResponse {
  data: {
    items: ApiPlayerEntry[];
  };
}



export const Leaderboard: React.FC<LeaderboardProps> = ({

  title = "Leaderboard",
}) => {
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const initialId = "199";

        const firstResponse = await fetchExternalUrl(initialId);
        console.log("Response from fetchExternalUrl:", firstResponse);

        if (firstResponse && firstResponse.data && firstResponse.data.leaderboards && firstResponse.data.leaderboards.length > 0) {
          const externalId = firstResponse.data.leaderboards[0].externalId;
          const promotionIdForLeaderboard = initialId;

          const secondResponse: LeaderboardApiResponse = await leaderboardData(
              promotionIdForLeaderboard,
              externalId.toString()
          );
          console.log("Response from leaderboardData:", secondResponse);

          const formattedEntries: LeaderboardEntry[] = secondResponse.data.items.map((apiEntry: ApiPlayerEntry, index: number) => ({
            rank: index + 1,
            name: apiEntry.playerUsername,
            score: apiEntry.amount,

          }));

          setLeaderboardEntries(formattedEntries);
        } else {
          console.error(
              "Could not find necessary data in the response from fetchExternalUrl:",
              firstResponse
          );
          setError("Failed to retrieve initial leaderboard configuration.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading leaderboard...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }
  return (
    <div className={styles.leaderboard}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.header}>
        <div className={styles.rank}>Rank</div>
        <div className={styles.player}>Player</div>
        <div className={styles.score}>Score</div>
      </div>
      {leaderboardEntries.length === 0 ? (
          <section className={`${styles.oa_dashboard__not_found} ${styles.oa_is_visible}`}>
            <img
                src="https://i.postimg.cc/QdqTx81y/Frame-1984078017.png"
                alt="No data found"
                className={styles.oa_dashboard__not_found_image}
            />
          </section>
      ) :
          (
          <section className={styles.main}>
            <table className={styles.table}>
              <thead className={styles.oa_leaderboard__header}>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Player</th>
                <th scope="col">Score</th>
                <th scope="col">Details</th>
              </tr>
              </thead>
              <tbody className={`${styles.oa_leaderboard__body} ${styles.clearable}`}>
              {leaderboardEntries.map((entry) => (
                  <tr key={entry.rank} className={entry.isCurrentUser ? styles.oa_current : ""}>
                    <td>
                      {entry.rank <= 3 ? (
                          <span
                              className={`${styles.trophy} ${styles[`trophy-${entry.rank}`]}`}
                          >
                          {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                        </span>
                      ) : (
                          entry.rank
                      )}
                    </td>
                    <td>
                      <div className={styles.player_cell_content}>
                        {entry.avatar && (
                            <img
                                src={entry.avatar}
                                alt={`${entry.name}'s avatar`}
                                className={styles.avatar}
                            />
                        )}
                        <span className={styles.name}>{entry.name}</span>
                      </div>
                    </td>
                    <td>{entry.score.toLocaleString()}</td>

                  </tr>
              ))
              }
              </tbody>
            </table>
          </section>)
      }
    </div>
  );
};

export default Leaderboard;
