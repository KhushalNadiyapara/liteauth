'use client'

import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { authAPI } from '@/app/_lib/apiServices'
import { useAPI } from '@/app/_lib/useAPI'
import { useRouter } from 'next/navigation'

import Register from '@/app/_components/RegisterForm'

export default function RegisterForm() {
    return(
      <Register/>
    );
}
