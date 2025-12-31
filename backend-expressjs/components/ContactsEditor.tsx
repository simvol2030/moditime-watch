import React, { useState, useEffect } from 'react';
import { Box, Label, Input, TextArea, H5, Text, Button, Icon } from '@adminjs/design-system';
import type { EditPropertyProps } from 'adminjs';

interface ContactMethod {
	icon: string;
	title: string;
	value: string;
	description?: string;
	href?: string;
	primary?: boolean;
}

interface OfficeInfo {
	address: string;
	hours: string;
	metro?: string;
}

interface ContactsMeta {
	title?: string;
	description?: string;
	keywords?: string;
	contactMethods?: ContactMethod[];
	officeInfo?: OfficeInfo;
}

const defaultContactMethod: ContactMethod = {
	icon: 'phone',
	title: '',
	value: '',
	description: '',
	href: '',
	primary: false
};

const defaultOfficeInfo: OfficeInfo = {
	address: '',
	hours: '',
	metro: ''
};

const ContactsEditor: React.FC<EditPropertyProps> = (props) => {
	const { record, onChange, property } = props;
	const template = record.params.template;

	const [meta, setMeta] = useState<ContactsMeta>({
		title: '',
		description: '',
		keywords: '',
		contactMethods: [],
		officeInfo: defaultOfficeInfo
	});

	useEffect(() => {
		try {
			const rawValue = record.params[property.path] || '{}';
			const parsed = JSON.parse(rawValue);
			setMeta({
				title: parsed.title || '',
				description: parsed.description || '',
				keywords: parsed.keywords || '',
				contactMethods: parsed.contactMethods || [],
				officeInfo: parsed.officeInfo || defaultOfficeInfo
			});
		} catch (e) {
			// Invalid JSON, keep defaults
		}
	}, [record.params[property.path]]);

	const updateMeta = (updated: ContactsMeta) => {
		setMeta(updated);
		onChange(property.path, JSON.stringify(updated, null, 2));
	};

	const handleSeoChange = (field: 'title' | 'description' | 'keywords', value: string) => {
		updateMeta({ ...meta, [field]: value });
	};

	const handleContactMethodChange = (
		index: number,
		field: keyof ContactMethod,
		value: string | boolean
	) => {
		const updated = [...(meta.contactMethods || [])];
		updated[index] = { ...updated[index], [field]: value };
		updateMeta({ ...meta, contactMethods: updated });
	};

	const addContactMethod = () => {
		updateMeta({
			...meta,
			contactMethods: [...(meta.contactMethods || []), { ...defaultContactMethod }]
		});
	};

	const removeContactMethod = (index: number) => {
		const updated = (meta.contactMethods || []).filter((_, i) => i !== index);
		updateMeta({ ...meta, contactMethods: updated });
	};

	const handleOfficeChange = (field: keyof OfficeInfo, value: string) => {
		updateMeta({
			...meta,
			officeInfo: { ...(meta.officeInfo || defaultOfficeInfo), [field]: value }
		});
	};

	// Show contacts-specific fields only for contacts template
	const isContactsTemplate = template === 'contacts';

	return (
		<Box>
			{/* SEO Fields - Always shown */}
			<Box mb="xxl" bg="grey20" borderRadius="lg" padding="xl">
				<H5 mb="lg">SEO Metadata</H5>

				<Box mb="lg">
					<Label htmlFor="meta-title">SEO Title</Label>
					<Input
						id="meta-title"
						value={meta.title}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleSeoChange('title', e.target.value)
						}
						placeholder="Page title for search engines"
					/>
					<Text variant="sm" mt="sm" opacity={0.6}>
						Recommended: 50-60 characters
					</Text>
				</Box>

				<Box mb="lg">
					<Label htmlFor="meta-description">SEO Description</Label>
					<TextArea
						id="meta-description"
						value={meta.description}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
							handleSeoChange('description', e.target.value)
						}
						placeholder="Page description for search results"
						rows={3}
					/>
					<Text variant="sm" mt="sm" opacity={0.6}>
						Recommended: 150-160 characters
					</Text>
				</Box>

				<Box>
					<Label htmlFor="meta-keywords">Keywords</Label>
					<Input
						id="meta-keywords"
						value={meta.keywords}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleSeoChange('keywords', e.target.value)
						}
						placeholder="keyword1, keyword2, keyword3"
					/>
				</Box>
			</Box>

			{/* Contacts-specific Fields */}
			{isContactsTemplate && (
				<>
					{/* Contact Methods */}
					<Box mb="xxl" bg="grey20" borderRadius="lg" padding="xl">
						<Box display="flex" justifyContent="space-between" alignItems="center" mb="lg">
							<H5>Contact Methods</H5>
							<Button variant="primary" size="sm" onClick={addContactMethod}>
								<Icon icon="Plus" />
								Add Method
							</Button>
						</Box>

						{(meta.contactMethods || []).map((method, index) => (
							<Box
								key={index}
								bg="white"
								borderRadius="lg"
								padding="lg"
								mb="lg"
								boxShadow="card"
							>
								<Box display="flex" justifyContent="space-between" alignItems="center" mb="lg">
									<Text fontWeight="bold">Contact #{index + 1}</Text>
									<Button
										variant="danger"
										size="sm"
										onClick={() => removeContactMethod(index)}
									>
										<Icon icon="Trash" />
									</Button>
								</Box>

								<Box display="grid" gridTemplateColumns="1fr 1fr" gridGap="lg" mb="lg">
									<Box>
										<Label>Icon</Label>
										<Input
											value={method.icon}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												handleContactMethodChange(index, 'icon', e.target.value)
											}
											placeholder="phone, mail, clock, etc."
										/>
									</Box>
									<Box>
										<Label>Title</Label>
										<Input
											value={method.title}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												handleContactMethodChange(index, 'title', e.target.value)
											}
											placeholder="Phone"
										/>
									</Box>
								</Box>

								<Box display="grid" gridTemplateColumns="1fr 1fr" gridGap="lg" mb="lg">
									<Box>
										<Label>Value</Label>
										<Input
											value={method.value}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												handleContactMethodChange(index, 'value', e.target.value)
											}
											placeholder="+7 (999) 960-43-22"
										/>
									</Box>
									<Box>
										<Label>Link (href)</Label>
										<Input
											value={method.href}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												handleContactMethodChange(index, 'href', e.target.value)
											}
											placeholder="tel:+79999604322"
										/>
									</Box>
								</Box>

								<Box mb="lg">
									<Label>Description</Label>
									<Input
										value={method.description}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											handleContactMethodChange(index, 'description', e.target.value)
										}
										placeholder="Daily 10:00 - 22:00"
									/>
								</Box>

								<Box>
									<Label>
										<input
											type="checkbox"
											checked={method.primary || false}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												handleContactMethodChange(index, 'primary', e.target.checked)
											}
										/>
										{' '}Primary contact method
									</Label>
								</Box>
							</Box>
						))}

						{(meta.contactMethods || []).length === 0 && (
							<Text opacity={0.6} textAlign="center" padding="xl">
								No contact methods added. Click "Add Method" to create one.
							</Text>
						)}
					</Box>

					{/* Office Info */}
					<Box bg="grey20" borderRadius="lg" padding="xl">
						<H5 mb="lg">Office Information</H5>

						<Box mb="lg">
							<Label>Address</Label>
							<Input
								value={meta.officeInfo?.address || ''}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									handleOfficeChange('address', e.target.value)
								}
								placeholder="Moscow, Kutuzovsky Prospekt, 12, office 501"
							/>
						</Box>

						<Box display="grid" gridTemplateColumns="1fr 1fr" gridGap="lg">
							<Box>
								<Label>Working Hours</Label>
								<Input
									value={meta.officeInfo?.hours || ''}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleOfficeChange('hours', e.target.value)
									}
									placeholder="Mon-Sun: 10:00 - 22:00"
								/>
							</Box>
							<Box>
								<Label>Metro Station</Label>
								<Input
									value={meta.officeInfo?.metro || ''}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleOfficeChange('metro', e.target.value)
									}
									placeholder="m. Kutuzovskaya"
								/>
							</Box>
						</Box>
					</Box>
				</>
			)}
		</Box>
	);
};

export default ContactsEditor;
