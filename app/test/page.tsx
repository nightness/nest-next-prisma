"use server";
import "server-only";
import React from 'react';

// Let's work on instancing Nest Services in Next server-side code.

const TestPage: React.FC = () => {
    return (
        <div>
            <h1>Welcome to the Test Page</h1>
            <p>This is a generic page in the Next.js App Router.</p>
        </div>
    );
};

export default TestPage;