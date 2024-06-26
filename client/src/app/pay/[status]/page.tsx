import { FC } from 'react';

interface StatusPageProps {
    params: {
        status: string;
    };
}

const StatusPage: FC<StatusPageProps> = ({ params }) => {
    return <h1>{params.status.toUpperCase()}</h1>;
};

export default StatusPage;
