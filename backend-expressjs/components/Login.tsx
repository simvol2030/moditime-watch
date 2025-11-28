import React, { useState } from 'react';
import { Box, H2, Text, Input, Button, Label, MessageBox } from '@adminjs/design-system';

const Login = (props: any) => {
	const { action, errorMessage } = props;
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	return (
		<Box
			bg="white"
			height="100vh"
			display="flex"
			alignItems="center"
			justifyContent="center"
			flexDirection="column"
		>
			<Box
				bg="grey20"
				borderRadius="lg"
				padding="xxl"
				width="400px"
				boxShadow="card"
			>
				<Box textAlign="center" mb="xxl">
					<H2 mb="default">SEO Campaign Manager</H2>
					<Text opacity={0.8}>
						Professional SEO content management platform for search engine optimization,
						programmatic SEO campaigns, and organic traffic growth.
					</Text>
				</Box>

				{errorMessage && (
					<MessageBox message={errorMessage} variant="danger" mb="xl" />
				)}

				<form action={action} method="POST">
					<Box mb="lg">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							value={email}
							onChange={(e: any) => setEmail(e.target.value)}
							placeholder="admin@example.com"
							required
						/>
					</Box>

					<Box mb="xl">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							value={password}
							onChange={(e: any) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
						/>
					</Box>

					<Button variant="primary" size="lg" width="100%" type="submit">
						Sign In
					</Button>
				</form>

				<Box textAlign="center" mt="lg" opacity={0.6}>
					<Text variant="sm">Manage content, track rankings, grow traffic</Text>
				</Box>
			</Box>
		</Box>
	);
};

export default Login;
