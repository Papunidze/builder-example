import React from "react";
import styles from "./leaderboard.module.scss";
export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar?: string;
}

export interface LeaderboardProps {
  entries?: LeaderboardEntry[];
  title?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries = [
    {
      rank: 1,
      name: "Player 1",
      score: 1200,
      avatar: "https://via.placeholder.com/40",
    },
    {
      rank: 2,
      name: "Player 2",
      score: 1150,
      avatar: "https://via.placeholder.com/40",
    },
    {
      rank: 3,
      name: "Player 3",
      score: 1050,
      avatar: "https://via.placeholder.com/40",
    },
    {
      rank: 4,
      name: "Player 4",
      score: 950,
      avatar: "https://via.placeholder.com/40",
    },
    {
      rank: 5,
      name: "Player 5",
      score: 900,
      avatar: "https://via.placeholder.com/40",
    },
  ],
  title = "Leaderboard",
}) => {
  return (
    <div className={styles.leaderboard}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.leaderboardHeader}>
        <div className={styles.rank}>Rank</div>
        <div className={styles.player}>Player</div>
        <div className={styles.score}>Score</div>
      </div>
      {entries.map((entry) => (
        <div key={entry.rank} className={styles.leaderboardEntry}>
          <div className={styles.rank}>
            {entry.rank <= 3 ? (
              <span
                className={`${styles.trophy} ${styles[`trophy-${entry.rank}`]}`}
              >
                {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
              </span>
            ) : (
              entry.rank
            )}
          </div>
          <div className={styles.player}>
            {entry.avatar && (
              <img
                src={entry.avatar}
                alt={`${entry.name}'s avatar`}
                className={styles.avatar}
              />
            )}
            <span className={styles.name}>{entry.name}</span>
          </div>
          <div className={styles.score}>{entry.score.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;
