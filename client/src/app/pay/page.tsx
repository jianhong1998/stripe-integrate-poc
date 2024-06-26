'use client';

import { BACKEND_URL } from '@/constants';
import { FC } from 'react';

const PreviewPage: FC = () => {
    const paymentButtonOnClick = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/payment`, {
                method: 'POST',
            });

            const result = (await response.json()) as { sessionUrl: string };

            window.location.replace(result.sessionUrl);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <button onClick={paymentButtonOnClick}>Pay</button>
        </div>
    );
};

export default PreviewPage;
