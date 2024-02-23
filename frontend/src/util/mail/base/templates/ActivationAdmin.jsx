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
        return `http://${process.env.REACT_APP_HOST}/activation/{{=token}}`
    } else {
        return `https://${process.env.REACT_APP_HOST}/activation/{{=token}}`
    }
}


export const ActivationAdmin = () => {

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
                            your user account at the {process.env.REACT_APP_NAME} has been reset by an administrator.
                        </Text>
                        <Text style={styles.paragraph}>
                            Please provide your registration details to reactivate your account.
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
                            Reactivate Account
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
                            You will not be able to log into {process.env.REACT_APP_NAME} before you properly reactivate your account.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>

    );
};

export default ActivationAdmin
