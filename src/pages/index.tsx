import React, { useContext } from 'react';
import { MasterLayout } from '@components';
import { Card } from 'react-bootstrap';
import { AuthContext } from 'src/contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import ApiFetch from 'src/api';
import { IUser } from 'src/interfaces/IUser';

export default function Dashboard():JSX.Element {
    const { user } = useContext(AuthContext);
    return (
        <MasterLayout>
            <Card>
                <Card.Header>{user?.name}</Card.Header>
                <Card.Body>
                    <h2>Teste</h2>
                </Card.Body>
            </Card>
        </MasterLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { resolvedUrl } = ctx;
    const { ['brasilnet-manager.token']: token } = parseCookies(ctx);

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            }
        };
    }

    const response = await ApiFetch.get('/user', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status == 200) {
        const user:IUser = response.data;

        if (user && !user.permissions.includes(resolvedUrl)) {
            return {
                redirect: {
                    destination: '/401',
                    permanent: false,
                }
            };
        }
    }

    return {
        props: {},
    };
}