// pages/index.js

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import ApplicationList from '../components/ApplicationList';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session) router.push('/auth/signin'); // Redirect to sign-in if not authenticated
  }, [session, status, router]);

  if (status === 'loading' || !session) {
    return null; 
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <ApplicationList />
      </div>
    </>
  );
}
