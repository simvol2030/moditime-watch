import React, { useState, useEffect } from 'react';
import { Box, Label, Input, TextArea, H5, Text } from '@adminjs/design-system';
import type { EditPropertyProps } from 'adminjs';

interface PageMeta {
	title?: string;
	description?: string;
	keywords?: string;
}

const PageMetaEditor: React.FC<EditPropertyProps> = (props) => {
	const { record, onChange, property } = props;
	const [meta, setMeta] = useState<PageMeta>({
		title: '',
		description: '',
		keywords: ''
	});

	useEffect(() => {
		try {
			const rawValue = record.params[property.path] || '{}';
			const parsed = JSON.parse(rawValue);
			setMeta({
				title: parsed.title || '',
				description: parsed.description || '',
				keywords: parsed.keywords || ''
			});
		} catch (e) {
			// Invalid JSON, keep defaults
		}
	}, [record.params[property.path]]);

	const handleChange = (field: keyof PageMeta, value: string) => {
		const updated = { ...meta, [field]: value };
		setMeta(updated);

		// Preserve other fields from original JSON (like contactMethods, officeInfo for contacts page)
		try {
			const original = JSON.parse(record.params[property.path] || '{}');
			const merged = { ...original, ...updated };
			onChange(property.path, JSON.stringify(merged, null, 2));
		} catch (e) {
			onChange(property.path, JSON.stringify(updated, null, 2));
		}
	};

	return (
		<Box mb="xl">
			<H5 mb="lg">SEO Metadata</H5>

			<Box mb="lg">
				<Label htmlFor="meta-title">SEO Title</Label>
				<Input
					id="meta-title"
					value={meta.title}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						handleChange('title', e.target.value)
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
						handleChange('description', e.target.value)
					}
					placeholder="Page description for search results"
					rows={3}
				/>
				<Text variant="sm" mt="sm" opacity={0.6}>
					Recommended: 150-160 characters
				</Text>
			</Box>

			<Box mb="lg">
				<Label htmlFor="meta-keywords">Keywords</Label>
				<Input
					id="meta-keywords"
					value={meta.keywords}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						handleChange('keywords', e.target.value)
					}
					placeholder="keyword1, keyword2, keyword3"
				/>
				<Text variant="sm" mt="sm" opacity={0.6}>
					Comma-separated keywords for SEO
				</Text>
			</Box>
		</Box>
	);
};

export default PageMetaEditor;
