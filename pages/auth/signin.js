// pages/auth/signin.js

import { getProviders, signIn } from "next-auth/react";
import Navbar from "../../components/Navbar";
import Image from 'next/image'; // For optimized image handling

export default function SignIn({ providers }) {
  return (
    <div>
      <Navbar simple />
      <div className="signin-container">
        <h1>Sign In</h1>
        <p className="signin-message">Please sign in to view your job applications.</p>
        {providers &&
          Object.values(providers).map((provider) => (
            <div key={provider.name} className="signin-button-wrapper">
              <button
                onClick={() => signIn(provider.id, { callbackUrl: "/" })}
                className="signin-button"
              >
                Sign in with {provider.name}
                {/* Add Google Logo */}
                {provider.name === "Google" && (
                  <Image
                    src="/google-logo.png"
                    alt="Google Logo"
                    width={20}
                    height={20}
                    className="google-logo"
                  />
                )}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

// Fetch the providers server-side
export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
