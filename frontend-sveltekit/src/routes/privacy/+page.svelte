<script lang="ts">
	import SeoManager from '$lib/components/seo/SeoManager.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Data from database via +page.server.ts
	const { seo, page } = data;
</script>

<SeoManager {seo} />

<main class="page-main legal-page">
	<Container>
		<div class="legal-content">
			<h1 class="legal-title">Политика конфиденциальности</h1>
			<p class="legal-date">Дата последнего обновления: 20 ноября 2024</p>

			<section class="legal-section">
				<h2>1. Общие положения</h2>
				<p>
					Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных
					данных пользователей сайта moditimewatch.com (далее — «Сайт»), предоставляемых при
					использовании сервисов компании Moditimewatch (далее — «Компания»).
				</p>
				<p>
					Используя Сайт и сервисы Компании, вы подтверждаете свое согласие с условиями настоящей
					Политики конфиденциальности.
				</p>
			</section>

			<section class="legal-section">
				<h2>2. Собираемые данные</h2>
				<p>При использовании наших сервисов мы можем собирать следующую информацию:</p>
				<ul>
					<li>
						<strong>Личные данные:</strong> имя, фамилия, адрес электронной почты, номер телефона,
						адрес доставки
					</li>
					<li>
						<strong>Данные о заказах:</strong> информация о покупках, предпочтениях, истории
						взаимодействия с консьержем
					</li>
					<li>
						<strong>Технические данные:</strong> IP-адрес, тип браузера, операционная система,
						cookie-файлы, данные о посещениях страниц
					</li>
					<li>
						<strong>Платежные данные:</strong> информация о транзакциях (данные банковских карт
						обрабатываются платежными системами, мы не храним их)
					</li>
				</ul>
			</section>

			<section class="legal-section">
				<h2>3. Цели обработки данных</h2>
				<p>Мы используем ваши персональные данные для:</p>
				<ul>
					<li>Обработки и выполнения заказов</li>
					<li>Персонального консьерж-сервиса и подбора часов</li>
					<li>Коммуникации с клиентами по вопросам заказов и сервиса</li>
					<li>Улучшения качества сервисов и пользовательского опыта</li>
					<li>Предоставления информации о новых моделях и специальных предложениях</li>
					<li>Выполнения юридических обязательств</li>
					<li>Предотвращения мошенничества и обеспечения безопасности</li>
				</ul>
			</section>

			<section class="legal-section">
				<h2>4. Защита данных</h2>
				<p>Мы применяем современные методы защиты информации:</p>
				<ul>
					<li>SSL/TLS шифрование для всех передаваемых данных</li>
					<li>Защищенные серверы и базы данных с ограниченным доступом</li>
					<li>Регулярные аудиты безопасности и обновления систем</li>
					<li>Ограниченный доступ сотрудников к персональным данным</li>
					<li>Соглашения о конфиденциальности со всеми партнерами</li>
				</ul>
			</section>

			<section class="legal-section">
				<h2>5. Передача данных третьим лицам</h2>
				<p>Мы можем передавать ваши данные третьим лицам в следующих случаях:</p>
				<ul>
					<li>
						<strong>Службам доставки:</strong> для выполнения заказов (имя, адрес, телефон)
					</li>
					<li>
						<strong>Платежным системам:</strong> для обработки транзакций (в зашифрованном виде)
					</li>
					<li>
						<strong>Партнерам по сервису:</strong> официальным сервисным центрам брендов (при
						необходимости)
					</li>
					<li><strong>По требованию закона:</strong> государственным органам при наличии запроса</li>
				</ul>
				<p>
					Мы не продаем и не передаем ваши персональные данные третьим лицам для маркетинговых
					целей без вашего явного согласия.
				</p>
			</section>

			<section class="legal-section">
				<h2>6. Сookie-файлы</h2>
				<p>Мы используем cookie-файлы для:</p>
				<ul>
					<li>Запоминания ваших предпочтений (язык, валюта, тема оформления)</li>
					<li>Анализа посещаемости сайта (Google Analytics, Яндекс.Метрика)</li>
					<li>Персонализации контента и предложений</li>
					<li>Обеспечения безопасности и предотвращения мошенничества</li>
				</ul>
				<p>Вы можете отключить cookie в настройках браузера, но это может ограничить функционал Сайта.</p>
			</section>

			<section class="legal-section">
				<h2>7. Ваши права</h2>
				<p>В соответствии с законодательством вы имеете право:</p>
				<ul>
					<li>Получать информацию о том, какие данные о вас хранятся</li>
					<li>Запрашивать исправление неточных данных</li>
					<li>Требовать удаления ваших персональных данных</li>
					<li>Ограничивать обработку данных</li>
					<li>Получить копию ваших данных в структурированном формате</li>
					<li>Отозвать согласие на обработку данных</li>
				</ul>
				<p>
					Для реализации этих прав свяжитесь с нами по email:
					<a href="mailto:privacy@moditimewatch.com">privacy@moditimewatch.com</a>
				</p>
			</section>

			<section class="legal-section">
				<h2>8. Хранение данных</h2>
				<p>
					Мы храним ваши персональные данные не дольше, чем это необходимо для достижения целей
					обработки или выполнения юридических обязательств. Данные о заказах хранятся в течение 5
					лет для целей гарантийного обслуживания.
				</p>
			</section>

			<section class="legal-section">
				<h2>9. Изменения в Политике</h2>
				<p>
					Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности.
					Актуальная версия всегда доступна на данной странице с указанием даты последнего
					обновления.
				</p>
			</section>

			<section class="legal-section">
				<h2>10. Контакты</h2>
				<p>По вопросам обработки персональных данных обращайтесь:</p>
				<ul>
					<li>
						Email: <a href="mailto:privacy@moditimewatch.com">privacy@moditimewatch.com</a>
					</li>
					<li>Телефон: <a href="tel:+79999604322">+7 (999) 960-43-22</a></li>
					<li>Адрес: г. Москва, Кутузовский проспект, д. 12, офис 501</li>
				</ul>
			</section>
		</div>
	</Container>
</main>

<style>
	.legal-page {
		padding: var(--space-4xl) 0;
	}

	.legal-content {
		max-width: 900px;
		margin: 0 auto;
	}

	.legal-title {
		font-size: var(--font-size-h1);
		margin-bottom: var(--space-md);
		text-align: center;
	}

	.legal-date {
		text-align: center;
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
		margin-bottom: var(--space-3xl);
	}

	.legal-section {
		margin-bottom: var(--space-3xl);
	}

	.legal-section h2 {
		font-size: var(--font-size-h3);
		margin-bottom: var(--space-lg);
		color: var(--color-primary);
	}

	.legal-section p {
		font-size: var(--font-size-body);
		line-height: var(--line-height-relaxed);
		margin-bottom: var(--space-md);
	}

	.legal-section ul {
		list-style: disc;
		padding-left: var(--space-xl);
		margin-bottom: var(--space-md);
	}

	.legal-section li {
		font-size: var(--font-size-body);
		line-height: var(--line-height-relaxed);
		margin-bottom: var(--space-sm);
	}

	.legal-section a {
		color: var(--color-primary);
		text-decoration: underline;
	}

	.legal-section strong {
		font-weight: 600;
		color: var(--color-text);
	}
</style>
