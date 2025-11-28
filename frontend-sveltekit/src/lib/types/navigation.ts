export interface NavigationLink {
	label: string;
	href: string;
	submenu?: NavigationLink[];
}

export interface NavigationData {
	desktop: NavigationLink[];
}
