/**
 * Breadcrumbs component types
 * Moditimewatch - Navigation trail component
 */

export interface BreadcrumbItem {
	label: string;
	href?: string; // undefined for last item (current page)
}

export interface BreadcrumbsProps {
	items: BreadcrumbItem[];
}
