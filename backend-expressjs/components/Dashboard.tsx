import React from 'react';
import { Box, H2, H5, Text } from '@adminjs/design-system';

const Dashboard = () => {
	return (
		<Box padding="xxl">
			<H2>Moditimewatch Admin</H2>
			<Text mt="default" mb="xxl" opacity={0.8}>
				Premium watch e-commerce management system. Manage products, orders, content, and SEO.
			</Text>

			<Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gridGap="xl">
				<Box bg="white" borderRadius="lg" padding="xl" boxShadow="card">
					<H5 mb="default">E-commerce</H5>
					<Text opacity={0.8}>
						Manage products, brands, categories, images, and reviews. Set prices, availability
						status, and featured items for the catalog.
					</Text>
				</Box>

				<Box bg="white" borderRadius="lg" padding="xl" boxShadow="card">
					<H5 mb="default">Orders</H5>
					<Text opacity={0.8}>
						View and manage customer orders. Update order status, track delivery, and review order
						history and status changes.
					</Text>
				</Box>

				<Box bg="white" borderRadius="lg" padding="xl" boxShadow="card">
					<H5 mb="default">Homepage Content</H5>
					<Text opacity={0.8}>
						Edit hero section, collections, services, statistics, and customer testimonials displayed
						on the main page.
					</Text>
				</Box>

				<Box bg="white" borderRadius="lg" padding="xl" boxShadow="card">
					<H5 mb="default">Articles & Journal</H5>
					<Text opacity={0.8}>
						Create and publish articles, manage categories, and control which content is featured on
						the homepage.
					</Text>
				</Box>

				<Box bg="white" borderRadius="lg" padding="xl" boxShadow="card">
					<H5 mb="default">SEO - Cities</H5>
					<Text opacity={0.8}>
						Programmatic SEO for 250+ Russian cities. Manage city pages, local content, delivery
						info, and SEO metadata.
					</Text>
				</Box>

				<Box bg="white" borderRadius="lg" padding="xl" boxShadow="card">
					<H5 mb="default">Layout & Navigation</H5>
					<Text opacity={0.8}>
						Configure header navigation, footer sections and links, and reusable widgets like
						Telegram CTA and search.
					</Text>
				</Box>

				<Box bg="white" borderRadius="lg" padding="xl" boxShadow="card">
					<H5 mb="default">Pages & SEO Meta</H5>
					<Text opacity={0.8}>
						Manage static pages (About, Delivery, Warranty, etc.) and SEO metadata for all page
						types including JSON-LD schemas.
					</Text>
				</Box>

				<Box bg="white" borderRadius="lg" padding="xl" boxShadow="card">
					<H5 mb="default">Email Templates</H5>
					<Text opacity={0.8}>
						Configure email templates for order confirmations, shipping notifications, and other
						customer communications.
					</Text>
				</Box>
			</Box>
		</Box>
	);
};

export default Dashboard;
