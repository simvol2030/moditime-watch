import AdminJS, { ComponentLoader } from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSSequelize from '@adminjs/sequelize';
import path from 'path';

// Import all models
import {
	Admin,
	initializeAdmins,
	// E-commerce
	Brand,
	Category,
	Product,
	ProductImage,
	ProductHighlight,
	ProductTab,
	ProductBenefit,
	Review,
	Order,
	OrderItem,
	OrderStatusHistory,
	// Content - Homepage
	HomeHero,
	Collection,
	HomeService,
	HomeServiceStat,
	Testimonial,
	// Content - Articles
	ArticleCategory,
	Article,
	// Content - Cities (Programmatic SEO)
	City,
	CityArticle,
	// Layout
	NavigationItem,
	FooterSection,
	FooterLink,
	Widget,
	// Pages & SEO
	Page,
	SeoMeta,
	// Email
	EmailTemplate,
	EmailLog,
	// System
	SiteConfig,
	User,
	Post
} from './db';

// Register the Sequelize adapter
AdminJS.registerAdapter({
	Resource: AdminJSSequelize.Resource,
	Database: AdminJSSequelize.Database
});

// Authentication function - checks against Admin table
const authenticate = async (email: string, password: string) => {
	console.log('Login attempt:', { email });

	try {
		const admin = await Admin.findOne({ where: { email } });

		if (admin && admin.password === password) {
			console.log('Authentication successful - Role:', admin.role);
			return {
				id: admin.id,
				email: admin.email,
				role: admin.role,
				name: admin.name
			};
		}

		console.log('Authentication failed');
		return null;
	} catch (error) {
		console.error('Authentication error:', error);
		return null;
	}
};

// Permission helpers
const canModifyResource = ({ currentAdmin }: any) => {
	return currentAdmin && ['super-admin', 'editor'].includes(currentAdmin.role);
};

const canDelete = ({ currentAdmin }: any) => {
	return currentAdmin && currentAdmin.role === 'super-admin';
};

const isSuperAdmin = ({ currentAdmin }: any) => {
	return currentAdmin && currentAdmin.role === 'super-admin';
};

// Common property configurations
const commonProps = {
	id: { isVisible: { list: true, show: true, edit: false, filter: true } },
	created_at: { isVisible: { list: true, show: true, edit: false, filter: true } },
	updated_at: { isVisible: { list: false, show: true, edit: false, filter: false } }
};

const booleanProps = (field: string) => ({
	[field]: {
		availableValues: [
			{ value: 1, label: 'Yes' },
			{ value: 0, label: 'No' }
		]
	}
});

// Common actions configuration
const standardActions = {
	new: { isAccessible: canModifyResource },
	edit: { isAccessible: canModifyResource },
	delete: { isAccessible: canDelete },
	bulkDelete: { isAccessible: canDelete }
};

// Configure AdminJS
export async function setupAdmin() {
	// Initialize admins table
	await initializeAdmins();

	// Component loader for custom components
	const componentLoader = new ComponentLoader();

	const Components = {
		Dashboard: componentLoader.add('Dashboard', path.join(__dirname, '../components/Dashboard')),
		Login: componentLoader.add('Login', path.join(__dirname, '../components/Login')),
		PageMetaEditor: componentLoader.add(
			'PageMetaEditor',
			path.join(__dirname, '../components/PageMetaEditor')
		),
		ContactsEditor: componentLoader.add(
			'ContactsEditor',
			path.join(__dirname, '../components/ContactsEditor')
		)
	};

	const admin = new AdminJS({
		componentLoader,
		resources: [
			// ============================================
			// E-COMMERCE GROUP
			// ============================================
			{
				resource: Product,
				options: {
					navigation: { name: 'E-commerce', icon: 'ShoppingCart' },
					listProperties: ['id', 'name', 'brand_id', 'price', 'is_active', 'is_featured'],
					properties: {
						...commonProps,
						price: { type: 'number' },
						description: { type: 'textarea' },
						description_html: { type: 'richtext' },
						specs_json: { type: 'textarea' },
						meta_json: { type: 'textarea' },
						...booleanProps('is_active'),
						...booleanProps('is_featured'),
						...booleanProps('is_new'),
						...booleanProps('is_limited'),
						availability_status: {
							availableValues: [
								{ value: 'in-stock', label: 'In Stock' },
								{ value: 'pre-order', label: 'Pre-order' },
								{ value: 'waitlist', label: 'Waitlist' }
							]
						}
					},
					actions: standardActions
				}
			},
			{
				resource: ProductImage,
				options: {
					navigation: { name: 'E-commerce', icon: 'ShoppingCart' },
					properties: {
						...commonProps,
						...booleanProps('is_main')
					},
					actions: standardActions
				}
			},
			{
				resource: ProductHighlight,
				options: {
					navigation: { name: 'E-commerce', icon: 'ShoppingCart' },
					properties: commonProps,
					actions: standardActions
				}
			},
			{
				resource: ProductTab,
				options: {
					navigation: { name: 'E-commerce', icon: 'ShoppingCart' },
					properties: {
						...commonProps,
						content: { type: 'richtext' }
					},
					actions: standardActions
				}
			},
			{
				resource: ProductBenefit,
				options: {
					navigation: { name: 'E-commerce', icon: 'ShoppingCart' },
					properties: {
						...commonProps,
						icon_svg: { type: 'textarea' }
					},
					actions: standardActions
				}
			},
			{
				resource: Brand,
				options: {
					navigation: { name: 'E-commerce', icon: 'ShoppingCart' },
					listProperties: ['id', 'name', 'country', 'is_active', 'position'],
					properties: {
						...commonProps,
						description: { type: 'textarea' },
						...booleanProps('is_active')
					},
					actions: standardActions
				}
			},
			{
				resource: Category,
				options: {
					navigation: { name: 'E-commerce', icon: 'ShoppingCart' },
					listProperties: ['id', 'name', 'slug', 'parent_id', 'is_active'],
					properties: {
						...commonProps,
						description: { type: 'textarea' },
						...booleanProps('is_active')
					},
					actions: standardActions
				}
			},
			{
				resource: Review,
				options: {
					navigation: { name: 'E-commerce', icon: 'ShoppingCart' },
					listProperties: ['id', 'product_id', 'author_name', 'rating', 'is_active'],
					properties: {
						...commonProps,
						content: { type: 'textarea' },
						...booleanProps('is_active'),
						...booleanProps('is_verified')
					},
					actions: standardActions
				}
			},

			// ============================================
			// ORDERS GROUP
			// ============================================
			{
				resource: Order,
				options: {
					navigation: { name: 'Orders', icon: 'Receipt' },
					listProperties: ['id', 'order_number', 'customer_name', 'total_amount', 'status', 'created_at'],
					properties: {
						...commonProps,
						delivery_address: { type: 'textarea' },
						delivery_comment: { type: 'textarea' },
						status: {
							availableValues: [
								{ value: 'pending', label: 'Pending' },
								{ value: 'confirmed', label: 'Confirmed' },
								{ value: 'paid', label: 'Paid' },
								{ value: 'shipped', label: 'Shipped' },
								{ value: 'delivered', label: 'Delivered' },
								{ value: 'cancelled', label: 'Cancelled' }
							]
						}
					},
					actions: {
						new: { isAccessible: false }, // Orders created by customers
						edit: { isAccessible: canModifyResource },
						delete: { isAccessible: canDelete },
						bulkDelete: { isAccessible: canDelete }
					}
				}
			},
			{
				resource: OrderItem,
				options: {
					navigation: { name: 'Orders', icon: 'Receipt' },
					properties: commonProps,
					actions: {
						new: { isAccessible: false },
						edit: { isAccessible: canModifyResource },
						delete: { isAccessible: canDelete },
						bulkDelete: { isAccessible: canDelete }
					}
				}
			},
			{
				resource: OrderStatusHistory,
				options: {
					navigation: { name: 'Orders', icon: 'Receipt' },
					listProperties: ['id', 'order_id', 'old_status', 'new_status', 'changed_by', 'changed_at'],
					properties: {
						id: commonProps.id,
						comment: { type: 'textarea' }
					},
					actions: {
						new: { isAccessible: false },
						edit: { isAccessible: false },
						delete: { isAccessible: canDelete },
						bulkDelete: { isAccessible: canDelete }
					}
				}
			},

			// ============================================
			// CONTENT - HOMEPAGE GROUP
			// ============================================
			{
				resource: HomeHero,
				options: {
					navigation: { name: 'Content - Homepage', icon: 'Home' },
					properties: {
						...commonProps,
						description: { type: 'textarea' },
						stats_json: { type: 'textarea' },
						quick_links_json: { type: 'textarea' },
						brands_json: { type: 'textarea' },
						...booleanProps('is_active')
					},
					actions: standardActions
				}
			},
			{
				resource: Collection,
				options: {
					navigation: { name: 'Content - Homepage', icon: 'Home' },
					listProperties: ['id', 'title', 'category', 'is_active', 'position'],
					properties: {
						...commonProps,
						description: { type: 'textarea' },
						...booleanProps('is_active')
					},
					actions: standardActions
				}
			},
			{
				resource: HomeService,
				options: {
					navigation: { name: 'Content - Homepage', icon: 'Home' },
					listProperties: ['id', 'title', 'is_active', 'position'],
					properties: {
						...commonProps,
						icon_svg: { type: 'textarea' },
						description: { type: 'textarea' },
						...booleanProps('is_active')
					},
					actions: standardActions
				}
			},
			{
				resource: HomeServiceStat,
				options: {
					navigation: { name: 'Content - Homepage', icon: 'Home' },
					properties: {
						id: commonProps.id
					},
					actions: standardActions
				}
			},
			{
				resource: Testimonial,
				options: {
					navigation: { name: 'Content - Homepage', icon: 'Home' },
					listProperties: ['id', 'name', 'position', 'choice', 'is_active', 'display_order'],
					properties: {
						...commonProps,
						text: { type: 'textarea' },
						...booleanProps('is_active')
					},
					actions: standardActions
				}
			},

			// ============================================
			// CONTENT - ARTICLES GROUP
			// ============================================
			{
				resource: ArticleCategory,
				options: {
					navigation: { name: 'Content - Articles', icon: 'Document' },
					properties: commonProps,
					actions: standardActions
				}
			},
			{
				resource: Article,
				options: {
					navigation: { name: 'Content - Articles', icon: 'Document' },
					listProperties: ['id', 'title', 'category_id', 'is_published', 'is_featured', 'published_at'],
					properties: {
						...commonProps,
						excerpt: { type: 'textarea' },
						content: { type: 'richtext' },
						...booleanProps('is_published'),
						...booleanProps('is_featured')
					},
					actions: standardActions
				}
			},

			// ============================================
			// SEO - CITIES GROUP (PROGRAMMATIC SEO)
			// ============================================
			{
				resource: City,
				options: {
					navigation: { name: 'SEO - Cities', icon: 'Globe' },
					listProperties: ['id', 'name', 'slug', 'delivery_days', 'is_active', 'priority'],
					properties: {
						...commonProps,
						meta_description: { type: 'textarea' },
						...booleanProps('is_active')
					},
					actions: standardActions
				}
			},
			{
				resource: CityArticle,
				options: {
					navigation: { name: 'SEO - Cities', icon: 'Globe' },
					listProperties: ['id', 'city_id', 'title', 'template_type', 'is_published'],
					properties: {
						...commonProps,
						excerpt: { type: 'textarea' },
						content: { type: 'richtext' },
						...booleanProps('is_published'),
						template_type: {
							availableValues: [
								{ value: 'standard', label: 'Standard' },
								{ value: 'unique', label: 'Unique' },
								{ value: 'variant_A', label: 'Variant A' },
								{ value: 'variant_B', label: 'Variant B' }
							]
						}
					},
					actions: standardActions
				}
			},

			// ============================================
			// LAYOUT GROUP
			// ============================================
			{
				resource: NavigationItem,
				options: {
					navigation: { name: 'Layout', icon: 'Menu' },
					listProperties: ['id', 'label', 'href', 'menu_type', 'is_active', 'position'],
					properties: {
						...commonProps,
						...booleanProps('is_active'),
						menu_type: {
							availableValues: [
								{ value: 'header_desktop', label: 'Header Desktop' },
								{ value: 'header_mobile', label: 'Header Mobile' },
								{ value: 'footer', label: 'Footer' }
							]
						}
					},
					actions: standardActions
				}
			},
			{
				resource: FooterSection,
				options: {
					navigation: { name: 'Layout', icon: 'Menu' },
					listProperties: ['id', 'title', 'column_number', 'is_active', 'position'],
					properties: {
						id: commonProps.id,
						...booleanProps('is_active')
					},
					actions: standardActions
				}
			},
			{
				resource: FooterLink,
				options: {
					navigation: { name: 'Layout', icon: 'Menu' },
					listProperties: ['id', 'section_id', 'label', 'href', 'position'],
					properties: {
						id: commonProps.id
					},
					actions: standardActions
				}
			},
			{
				resource: Widget,
				options: {
					navigation: { name: 'Layout', icon: 'Menu' },
					listProperties: ['id', 'type', 'title', 'is_active', 'position'],
					properties: {
						...commonProps,
						description: { type: 'textarea' },
						data_json: { type: 'textarea' },
						...booleanProps('is_active')
					},
					actions: standardActions
				}
			},

			// ============================================
			// PAGES & SEO GROUP
			// ============================================
			{
				resource: Page,
				options: {
					navigation: { name: 'Pages & SEO', icon: 'File' },
					listProperties: ['id', 'slug', 'title', 'template', 'is_published'],
					properties: {
						...commonProps,
						content: { type: 'richtext' },
						meta_json: {
							type: 'mixed',
							components: {
								edit: Components.ContactsEditor,
								show: Components.ContactsEditor
							}
						},
						template: {
							availableValues: [
								{ value: 'about', label: 'About' },
								{ value: 'delivery', label: 'Delivery' },
								{ value: 'warranty', label: 'Warranty' },
								{ value: 'contacts', label: 'Contacts' },
								{ value: 'legal', label: 'Legal' }
							]
						},
						...booleanProps('is_published')
					},
					actions: standardActions
				}
			},
			{
				resource: SeoMeta,
				options: {
					navigation: { name: 'Pages & SEO', icon: 'File' },
					listProperties: ['id', 'page_type', 'entity_id', 'title', 'noindex'],
					properties: {
						...commonProps,
						description: { type: 'textarea' },
						og_description: { type: 'textarea' },
						json_ld: { type: 'textarea' },
						...booleanProps('noindex'),
						page_type: {
							availableValues: [
								{ value: 'home', label: 'Home' },
								{ value: 'catalog', label: 'Catalog' },
								{ value: 'product', label: 'Product' },
								{ value: 'article', label: 'Article' },
								{ value: 'city_page', label: 'City Page' },
								{ value: 'city_article', label: 'City Article' },
								{ value: 'static_page', label: 'Static Page' }
							]
						}
					},
					actions: standardActions
				}
			},

			// ============================================
			// EMAIL GROUP
			// ============================================
			{
				resource: EmailTemplate,
				options: {
					navigation: { name: 'Email', icon: 'Mail' },
					listProperties: ['id', 'template_key', 'subject', 'is_active'],
					properties: {
						...commonProps,
						body_html: { type: 'richtext' },
						body_text: { type: 'textarea' },
						...booleanProps('is_active')
					},
					actions: standardActions
				}
			},
			{
				resource: EmailLog,
				options: {
					navigation: { name: 'Email', icon: 'Mail' },
					listProperties: ['id', 'template_key', 'recipient_email', 'status', 'sent_at'],
					properties: {
						id: commonProps.id,
						error_message: { type: 'textarea' },
						status: {
							availableValues: [
								{ value: 'pending', label: 'Pending' },
								{ value: 'sent', label: 'Sent' },
								{ value: 'failed', label: 'Failed' }
							]
						}
					},
					actions: {
						new: { isAccessible: false },
						edit: { isAccessible: false },
						delete: { isAccessible: canDelete },
						bulkDelete: { isAccessible: canDelete }
					}
				}
			},

			// ============================================
			// SYSTEM GROUP
			// ============================================
			{
				resource: SiteConfig,
				options: {
					navigation: { name: 'System', icon: 'Settings' },
					listProperties: ['id', 'key', 'value', 'type'],
					properties: {
						...commonProps,
						value: { type: 'textarea' },
						description: { type: 'textarea' },
						type: {
							availableValues: [
								{ value: 'string', label: 'String' },
								{ value: 'number', label: 'Number' },
								{ value: 'boolean', label: 'Boolean' },
								{ value: 'json', label: 'JSON' }
							]
						}
					},
					actions: {
						new: { isAccessible: isSuperAdmin },
						edit: { isAccessible: isSuperAdmin },
						delete: { isAccessible: isSuperAdmin },
						bulkDelete: { isAccessible: isSuperAdmin }
					}
				}
			},
			{
				resource: Admin,
				options: {
					navigation: { name: 'System', icon: 'Settings' },
					listProperties: ['id', 'email', 'name', 'role', 'created_at'],
					properties: {
						...commonProps,
						password: {
							type: 'password',
							isVisible: { list: false, show: false, edit: true, filter: false }
						},
						role: {
							availableValues: [
								{ value: 'super-admin', label: 'Super Admin' },
								{ value: 'editor', label: 'Editor' },
								{ value: 'viewer', label: 'Viewer' }
							]
						}
					},
					actions: {
						new: { isAccessible: isSuperAdmin },
						edit: { isAccessible: isSuperAdmin },
						delete: { isAccessible: isSuperAdmin },
						bulkDelete: { isAccessible: isSuperAdmin }
					}
				}
			},
			{
				resource: User,
				options: {
					navigation: { name: 'System', icon: 'Settings' },
					properties: commonProps,
					actions: standardActions
				}
			},
			{
				resource: Post,
				options: {
					navigation: { name: 'System', icon: 'Settings' },
					listProperties: ['id', 'user_id', 'title', 'published', 'created_at'],
					properties: {
						...commonProps,
						content: { type: 'textarea' },
						...booleanProps('published')
					},
					actions: standardActions
				}
			}
		],
		rootPath: '/admin',
		branding: {
			companyName: 'Moditimewatch Admin',
			withMadeWithLove: false,
			logo: false,
			favicon: 'https://cdn-icons-png.flaticon.com/512/2972/2972531.png'
		},
		dashboard: {
			component: Components.Dashboard
		},
		pages: {
			login: {
				component: Components.Login
			}
		}
	});

	// Initialize AdminJS to ensure components are bundled
	await admin.initialize();

	// Build authenticated router
	const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
		admin,
		{
			authenticate,
			cookieName: 'adminjs',
			cookiePassword: process.env.COOKIE_SECRET || 'some-secret-password-at-least-32-characters-long'
		},
		null,
		{
			resave: true,
			saveUninitialized: true,
			secret: process.env.SESSION_SECRET || 'some-secret-session-key-at-least-32-characters',
			cookie: {
				httpOnly: process.env.NODE_ENV === 'production',
				secure: process.env.NODE_ENV === 'production'
			},
			name: 'adminjs'
		}
	);

	return { admin, adminRouter };
}
