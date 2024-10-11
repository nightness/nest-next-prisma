// app/auth/verify-email/page.tsx

import { sendVerificationEmail } from '@/app/auth/serverActions';
import styles from '../(styles)/auth.module.css';
import { redirect } from 'next/navigation';

export default function VerifyEmailRequestPage() {
  async function handleSubmit(formData: FormData) {
    'use server';

    const email = formData.get('email') as string;

    try {
      await sendVerificationEmail(email);
      // Redirect to a confirmation page
      redirect('/auth/verify-email/requested');
    } catch (error) {
      // Throw error to be caught by an error boundary
      throw new Error((error as Error)?.message || 'Unable to send verification email.');
    }
  }

  return (
    <div className={styles['form-container']}>
      <h1 className={styles['form-title']}>Request Email Verification</h1>
      <form action={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Send Verification Email
        </button>
      </form>
    </div>
  );
}
