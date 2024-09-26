// components/Navbar.js

import { signIn, signOut, useSession } from "next-auth/react";
import styles from "./Navbar.module.css"; // Import the CSS module
import Link from 'next/link';

function Navbar({ simple }) {
  const { data: session, status } = useSession();

  if (simple) {
    return (
      <nav className={styles.navbar}>
        <div className={styles.navbarCenter}>
          <h1>Job Application Logger</h1>
        </div>
      </nav>
    );
  }

  if (status === "loading") {
    return null;
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarCenter}>
        <h1>Job Application Logger</h1>
      </div>
      <div className={styles.navbarRight}>
        {session && session.user ? (
          <div className={styles.userInfo}>
            <span>{session.user.email}</span>
            <button onClick={() => signOut()} className={styles.authButton}>
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={() => signIn()} className={styles.authButton}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
