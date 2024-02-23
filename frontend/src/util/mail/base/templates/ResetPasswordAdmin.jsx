import * as React from 'react'

import {
    Body,
    Container,
    Column,
    Head,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
    Button,
} from '@react-email/components'

import styles from './Styles'
import Logo from './Logo'


import {interpolate as T} from './LodashTemplateMask'


const URL = () => {
    if(process.env.REACT_APP_HOST.startsWith('localhost')) {
        return `http://${process.env.REACT_APP_HOST}/reset-password/{{=token}}`
    } else {
        return `https://${process.env.REACT_APP_HOST}/reset-password/{{=token}}`
    }
}


export const ResetPasswordAdmin = () => {

    return (
        <Html>
            <Head />
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Section style={styles.logo}>
                        <Logo/>
                    </Section>
                    <Section style={styles.content} >
                        <Text style={styles.paragraph}>Dear User,</Text>
                        <Text style={styles.paragraph}>
                            an admin created a password reset link for you at the {process.env.REACT_APP_NAME}.
                        </Text>
                        <Text style={styles.paragraph}>
                            Please use the following link to reset your password
                        </Text>
                    </Section>
                    <Section style={styles.centered}>
                        <Button
                            // className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
                            style={styles.button}
                            pX={20}
                            pY={12}
                            href={URL()}
                        >
                            Reset Password
                        </Button>
                    </Section>
                    <Section style={styles.footer}>
                        <Text style={styles.paragraph}>
                            Alternatively copy and paste the following URL into your browser:
                        </Text>
                        <Text style={styles.url}>
                            {URL()}
                        </Text>
                        <Text style={styles.paragraph}>
                            The above link will be valid for 24 hours
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>

    );
};

export default ResetPasswordAdmin
