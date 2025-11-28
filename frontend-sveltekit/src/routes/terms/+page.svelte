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
			<h1 class="legal-title">Правила обработки персональных данных</h1>
			<p class="legal-date">Дата последнего обновления: 20 ноября 2024</p>

			<section class="legal-section">
				<h2>1. Термины и определения</h2>
				<ul>
					<li>
						<strong>Персональные данные</strong> — любая информация, относящаяся к прямо или косвенно
						определенному или определяемому физическому лицу (субъекту персональных данных).
					</li>
					<li>
						<strong>Обработка персональных данных</strong> — любое действие с персональными данными,
						включая сбор, запись, систематизацию, накопление, хранение, уточнение, извлечение,
						использование, передачу, обезличивание, блокирование, удаление, уничтожение.
					</li>
					<li>
						<strong>Оператор</strong> — ООО «Модитаймвотч», определяющее цели и содержание обработки
						персональных данных.
					</li>
				</ul>
			</section>

			<section class="legal-section">
				<h2>2. Основания обработки персональных данных</h2>
				<p>Обработка персональных данных осуществляется на основании:</p>
				<ul>
					<li>Согласия субъекта персональных данных на обработку его данных</li>
					<li>Договора, стороной которого является субъект персональных данных</li>
					<li>Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных»</li>
					<li>Федерального закона от 13.03.2006 № 38-ФЗ «О рекламе»</li>
				</ul>
			</section>

			<section class="legal-section">
				<h2>3. Категории обрабатываемых данных</h2>
				<p>Оператор обрабатывает следующие категории персональных данных:</p>
				<ul>
					<li>Фамилия, имя, отчество</li>
					<li>Контактные данные (телефон, email, адрес доставки)</li>
					<li>Данные документов (паспорт — для оформления таможенных деклараций)</li>
					<li>История заказов и предпочтений</li>
					<li>Информация о часах для trade-in</li>
					<li>Cookie и IP-адреса</li>
				</ul>
			</section>

			<section class="legal-section">
				<h2>4. Способы обработки данных</h2>
				<p>
					Обработка персональных данных осуществляется с использованием средств автоматизации и без
					использования таких средств. К способам обработки относятся:
				</p>
				<ul>
					<li>Сбор, запись, систематизация, накопление, хранение данных</li>
					<li>Уточнение (обновление, изменение) данных</li>
					<li>Извлечение, использование, передача (предоставление, доступ)</li>
					<li>Обезличивание, блокирование, удаление, уничтожение данных</li>
				</ul>
			</section>

			<section class="legal-section">
				<h2>5. Передача данных</h2>
				<p>
					Персональные данные могут передаваться третьим лицам исключительно для целей исполнения
					договора:
				</p>
				<ul>
					<li>Курьерским службам (Ferrari Group, DHL) — для доставки заказов</li>
					<li>Страховым компаниям — для страхования грузов</li>
					<li>
						Сервисным центрам брендов — для гарантийного и постгарантийного обслуживания (с вашего
						согласия)
					</li>
					<li>
						Платежным системам — для обработки транзакций (данные передаются в зашифрованном виде)
					</li>
				</ul>
				<p>
					Трансграничная передача данных осуществляется на территорию Швейцарии (офисы
					поставщиков) с обеспечением адекватного уровня защиты в соответствии с законодательством
					РФ.
				</p>
			</section>

			<section class="legal-section">
				<h2>6. Сроки обработки и хранения данных</h2>
				<ul>
					<li>
						<strong>Данные клиентов:</strong> хранятся в течение 5 лет с момента последнего заказа
						(гарантийный период)
					</li>
					<li>
						<strong>Данные заказов:</strong> 5 лет (для целей бухгалтерского учета и гарантий)
					</li>
					<li>
						<strong>Технические данные (логи):</strong> 6 месяцев (для анализа безопасности и
						трафика)
					</li>
					<li>
						<strong>Cookie-файлы:</strong> согласно настройкам вашего браузера (обычно до 1 года)
					</li>
				</ul>
				<p>По истечении сроков данные подлежат удалению или обезличиванию.</p>
			</section>

			<section class="legal-section">
				<h2>7. Права субъекта персональных данных</h2>
				<p>Вы имеете право:</p>
				<ul>
					<li>Получить подтверждение факта обработки ваших данных</li>
					<li>Получить информацию о целях, способах и сроках обработки</li>
					<li>Потребовать уточнения, блокирования или удаления данных</li>
					<li>Отозвать согласие на обработку данных</li>
					<li>Обжаловать действия Оператора в Роскомнадзоре или суде</li>
				</ul>
				<p>
					Для реализации прав направьте письменный запрос на email:
					<a href="mailto:privacy@moditimewatch.com">privacy@moditimewatch.com</a>
				</p>
			</section>

			<section class="legal-section">
				<h2>8. Безопасность данных</h2>
				<p>Оператор принимает организационные и технические меры для защиты данных:</p>
				<ul>
					<li>Шифрование данных при передаче (SSL/TLS)</li>
					<li>Ограничение доступа сотрудников к данным (принцип минимальных привилегий)</li>
					<li>Регулярные аудиты безопасности и обновления программного обеспечения</li>
					<li>Резервное копирование и защита от несанкционированного доступа</li>
					<li>Обучение сотрудников правилам обработки персональных данных</li>
				</ul>
			</section>

			<section class="legal-section">
				<h2>9. Ответственность</h2>
				<p>
					Оператор несет ответственность за нарушение требований законодательства о персональных
					данных в соответствии с законодательством Российской Федерации.
				</p>
				<p>
					В случае утраты или разглашения персональных данных Оператор информирует субъекта
					персональных данных об утрате или разглашении и принимает меры по восстановлению защиты.
				</p>
			</section>

			<section class="legal-section">
				<h2>10. Контактная информация</h2>
				<p><strong>ООО «Модитаймвотч»</strong></p>
				<ul>
					<li>ОГРН: 1234567890123</li>
					<li>ИНН: 1234567890</li>
					<li>Адрес: 119034, г. Москва, Кутузовский проспект, д. 12, офис 501</li>
					<li>Email: <a href="mailto:legal@moditimewatch.com">legal@moditimewatch.com</a></li>
					<li>Телефон: <a href="tel:+74951234567">+7 (495) 123-45-67</a></li>
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
