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


export const ResetPassword = () => {

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
                            You have requested the associated username for the account registered to this email address.
                        </Text>
                        <Text style={styles.paragraph}>
                            Your username is: <span style={{fontWeight: 'bold'}}>{`{{=username}}`}</span>
                        </Text>
                    </Section>
                    <Section style={styles.footer}>
                    </Section>
                </Container>
            </Body>
        </Html>

    );
};

export default ResetPassword
