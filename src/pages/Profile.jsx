import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getVolunteers } from '../services/firebaseService';
import LoadingSpinner from '../components/UI/LoadingSpinner';

export default function Profile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;
      try {
        // Find the volunteer record that matches the current user's UID
        // In the updated Register flow, the volunteer ID is the auth UID.
        const volunteers = await getVolunteers();
        const myProfile = volunteers.find(v => v.id === currentUser.uid);
        
        if (myProfile) {
          setProfile(myProfile);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <LoadingSpinner label="Loading profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-white p-8 shadow-card text-center">
          <h2 className="text-2xl font-bold text-navy">Profile Not Found</h2>
          <p className="mt-4 text-slate-600">We could not locate your volunteer profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[28px] bg-white p-8 shadow-card">
        <h1 className="text-3xl font-bold text-navy mb-6">Your Profile</h1>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Name</p>
                <p className="font-medium">{profile.name || 'Protected'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Phone</p>
                <p className="font-medium">{profile.phone || 'Protected'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Capabilities</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills || []).map(skill => (
                    <span key={skill} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 mb-2">Assets</p>
                <div className="flex flex-wrap gap-2">
                  {(profile.assets || []).map(asset => (
                    <span key={asset} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Status</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500 mb-1">Break-Glass Privacy</p>
                <p className="font-medium">{profile.breakGlassLocked ? 'Locked (Secure)' : 'Unlocked (Active Emergency)'}</p>
              </div>
              <div className={`h-3 w-3 rounded-full ${profile.breakGlassLocked ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
