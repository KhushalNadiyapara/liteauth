'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { authAPI } from '@/app/_lib/apiServices';
import { useAPI } from '@/app/_lib/useAPI';
import LoginForm from '@/app/_components/LoginForm';

export default function LoginPage() {
  return(
    <>
      <LoginForm/>
    </>
  )
 }
