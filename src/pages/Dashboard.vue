<script setup>
import { computed, ref } from "vue";

const unidades = [
	{
		id: 1,
		nome: "Unidade 101 - Torre A",
		links: [
			{ label: "Resumo da Cobrança", href: "#" },
			{ label: "Pendências", href: "#" },
			{ label: "Histórico", href: "#" },
		],
	},
	{
		id: 2,
		nome: "Unidade 202 - Torre A",
		links: [
			{ label: "Resumo da Cobrança", href: "#" },
			{ label: "Documentos", href: "#" },
			{ label: "Negociações", href: "#" },
		],
	},
	{
		id: 3,
		nome: "Unidade 305 - Torre B",
		links: [
			{ label: "Resumo da Cobrança", href: "#" },
			{ label: "Boletos", href: "#" },
			{ label: "Contato do Morador", href: "#" },
		],
	},
	{
		id: 4,
		nome: "Unidade 410 - Torre C",
		links: [
			{ label: "Resumo da Cobrança", href: "#" },
			{ label: "Ações Jurídicas", href: "#" },
			{ label: "Observações", href: "#" },
		],
	},
];

const unidadeAberta = ref(null);
const resumoUnidadeId = ref(null);

const linksEnviadosPorUnidade = ref({
	1: [
		{ id: 1, url: "https://cobranca.app/link/101-a", status: "Pendente", tentativas: 1 },
		{ id: 2, url: "https://cobranca.app/link/101-b", status: "Enviado", tentativas: 3 },
	],
	2: [{ id: 3, url: "https://cobranca.app/link/202-a", status: "Expirado", tentativas: 2 }],
	3: [{ id: 4, url: "https://cobranca.app/link/305-a", status: "Enviado", tentativas: 1 }],
	4: [{ id: 5, url: "https://cobranca.app/link/410-a", status: "Pendente", tentativas: 0 }],
});

const listaResumoAtual = computed(() => {
	if (!resumoUnidadeId.value) {
		return [];
	}

	return linksEnviadosPorUnidade.value[resumoUnidadeId.value] ?? [];
});

const unidadeResumoAtual = computed(() => {
	if (!resumoUnidadeId.value) {
		return null;
	}

	return unidades.find((unidade) => unidade.id === resumoUnidadeId.value) ?? null;
});

const alternarUnidade = (id) => {
	unidadeAberta.value = unidadeAberta.value === id ? null : id;
};

const abrirResumoCobranca = (id) => {
	resumoUnidadeId.value = id;
};

const gerarNovoLink = () => {
	if (!resumoUnidadeId.value) {
		return;
	}

	const unidadeId = resumoUnidadeId.value;
	const listaAtual = linksEnviadosPorUnidade.value[unidadeId] ?? [];
	const novoId = Date.now();

	linksEnviadosPorUnidade.value[unidadeId] = [
		{
			id: novoId,
			url: `https://cobranca.app/link/${unidadeId}-${novoId}`,
			status: "Pendente",
			tentativas: 0,
		},
		...listaAtual,
	];
};

const excluirLink = (linkId) => {
	if (!resumoUnidadeId.value) {
		return;
	}

	const unidadeId = resumoUnidadeId.value;
	linksEnviadosPorUnidade.value[unidadeId] = (linksEnviadosPorUnidade.value[unidadeId] ?? []).filter(
		(link) => link.id !== linkId,
	);
};

const alterarStatus = (linkId, novoStatus) => {
	if (!resumoUnidadeId.value) {
		return;
	}

	const unidadeId = resumoUnidadeId.value;
	linksEnviadosPorUnidade.value[unidadeId] = (linksEnviadosPorUnidade.value[unidadeId] ?? []).map((link) => {
		if (link.id !== linkId) {
			return link;
		}

		return {
			...link,
			status: novoStatus,
		};
	});
};
</script>

<template>
	<div class="dashboard-page">
		<aside class="sidebar">
			<div class="logo">Dashboard</div>

			<nav class="menu-unidades">
				<div v-for="unidade in unidades" :key="unidade.id" class="unidade-bloco">
					<button
						class="unidade-item"
						:class="{ ativo: unidadeAberta === unidade.id }"
						@click="alternarUnidade(unidade.id)"
						type="button"
					>
						<span>{{ unidade.nome }}</span>
						<span class="seta" :class="{ aberta: unidadeAberta === unidade.id }">⌄</span>
					</button>

					<ul class="dropdown-links" :class="{ aberto: unidadeAberta === unidade.id }">
						<li v-for="link in unidade.links" :key="link.label">
							<button
								v-if="link.label === 'Resumo da Cobrança'"
								type="button"
								class="link-item"
								@click="abrirResumoCobranca(unidade.id)"
							>
								{{ link.label }}
							</button>
							<a v-else :href="link.href">{{ link.label }}</a>
						</li>
					</ul>
				</div>
			</nav>
		</aside>

		<main class="content">
			<header class="top-bar">
				<h1>Visão Geral</h1>
			</header>

			<section class="cards">
				<article class="card">
					<p class="label">Total de Unidades</p>
					<h2>256</h2>
				</article>
				<article class="card">
					<p class="label">Ativas</p>
					<h2>189</h2>
				</article>
				<article class="card">
					<p class="label">Inadimplentes</p>
					<h2>67</h2>
				</article>
			</section>

			<section v-if="unidadeResumoAtual" class="resumo-section">
				<div class="resumo-header">
					<div>
						<h2>Resumo da Cobrança - {{ unidadeResumoAtual.nome }}</h2>
						<p>Links enviados, status e quantidade de tentativas.</p>
					</div>
					<button type="button" class="btn-gerar" @click="gerarNovoLink">Gerar novo link</button>
				</div>

				<div class="resumo-lista">
					<div class="resumo-linha resumo-cabecalho">
						<span>Link enviado</span>
						<span>Status</span>
						<span>Tentativas</span>
						<span>Ações</span>
					</div>

					<div v-for="item in listaResumoAtual" :key="item.id" class="resumo-linha">
						<a :href="item.url" target="_blank" rel="noopener noreferrer" class="link-url">{{ item.url }}</a>
						<select
							class="status-select"
							:value="item.status"
							@change="alterarStatus(item.id, $event.target.value)"
						>
							<option>Pendente</option>
							<option>Enviado</option>
							<option>Expirado</option>
						</select>
						<span>{{ item.tentativas }}</span>
						<button type="button" class="btn-excluir" @click="excluirLink(item.id)">Excluir</button>
					</div>

					<div v-if="!listaResumoAtual.length" class="resumo-vazio">
						Nenhum link enviado para esta unidade.
					</div>
				</div>
			</section>
		</main>
	</div>
</template>

<style scoped>
.dashboard-page {
	width: 100%;
	height: 100%;
	display: grid;
	grid-template-columns: 320px 1fr;
	background: #f6f7fb;
	color: #1f2937;
}

.sidebar {
	background: #ffffff;
	border-right: 1px solid #e5e7eb;
	padding: 22px 16px;
	overflow-y: auto;
}

.logo {
	font-size: 24px;
	font-weight: 700;
	margin-bottom: 20px;
}

.menu-unidades {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.unidade-bloco {
	display: flex;
	flex-direction: column;
}

.unidade-item {
	width: 100%;
	border: 1px solid #e5e7eb;
	background: #fff;
	border-radius: 10px;
	padding: 12px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 14px;
	text-align: left;
	cursor: pointer;
	transition: 0.2s ease;
}

.unidade-item:hover {
	border-color: #6d28d9;
}

.unidade-item.ativo {
	border-color: #6d28d9;
	background: #f5f3ff;
}

.seta {
	transition: transform 0.2s ease;
}

.seta.aberta {
	transform: rotate(180deg);
}

.dropdown-links {
	list-style: none;
	margin: -4px 0 4px;
	padding: 0 0 0 8px;
	max-height: 0;
	opacity: 0;
	overflow: hidden;
	transition: max-height 0.25s ease, opacity 0.25s ease;
}

.dropdown-links.aberto {
	max-height: 160px;
	opacity: 1;
}

.dropdown-links a {
	display: block;
	padding: 8px 10px;
	margin: 2px 0;
	border-radius: 8px;
	color: #4b5563;
	text-decoration: none;
	font-size: 13px;
}

.link-item {
	display: block;
	width: 100%;
	border: 0;
	background: transparent;
	padding: 8px 10px;
	margin: 2px 0;
	border-radius: 8px;
	color: #4b5563;
	font-size: 13px;
	text-align: left;
	cursor: pointer;
}

.dropdown-links a:hover,
.link-item:hover {
	background: #eef2ff;
	color: #4338ca;
}

.content {
	padding: 24px;
}

.top-bar h1 {
	font-size: 28px;
	margin-bottom: 16px;
}

.cards {
	display: grid;
	grid-template-columns: repeat(3, minmax(140px, 1fr));
	gap: 16px;
}

.card {
	background: #ffffff;
	border: 1px solid #e5e7eb;
	border-radius: 14px;
	padding: 16px;
}

.label {
	color: #6b7280;
	font-size: 13px;
}

.card h2 {
	margin-top: 6px;
}

.resumo-section {
	margin-top: 18px;
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 14px;
	padding: 18px;
}

.resumo-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
	margin-bottom: 14px;
}

.resumo-header h2 {
	font-size: 18px;
	margin: 0;
}

.resumo-header p {
	font-size: 13px;
	color: #6b7280;
	margin: 2px 0 0;
}

.btn-gerar {
	border: 1px solid #6d28d9;
	background: #6d28d9;
	color: #fff;
	padding: 9px 12px;
	border-radius: 8px;
	cursor: pointer;
	font-size: 13px;
}

.resumo-lista {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.resumo-linha {
	display: grid;
	grid-template-columns: 2fr 1fr 120px 110px;
	gap: 10px;
	align-items: center;
	border: 1px solid #eef2f7;
	border-radius: 10px;
	padding: 10px;
	font-size: 13px;
}

.resumo-cabecalho {
	font-weight: 600;
	background: #f8fafc;
}

.link-url {
	color: #2563eb;
	text-decoration: none;
	overflow-wrap: anywhere;
}

.status-select {
	border: 1px solid #d1d5db;
	border-radius: 8px;
	padding: 6px 8px;
	font-size: 13px;
	background: #fff;
}

.btn-excluir {
	border: 1px solid #ef4444;
	background: #fff;
	color: #ef4444;
	padding: 7px 10px;
	border-radius: 8px;
	cursor: pointer;
	font-size: 12px;
}

.resumo-vazio {
	font-size: 13px;
	color: #6b7280;
	padding: 8px 2px;
}

@media (max-width: 900px) {
	.dashboard-page {
		grid-template-columns: 1fr;
	}

	.sidebar {
		border-right: 0;
		border-bottom: 1px solid #e5e7eb;
	}

	.cards {
		grid-template-columns: 1fr;
	}

	.resumo-header {
		flex-direction: column;
		align-items: flex-start;
	}

	.resumo-linha {
		grid-template-columns: 1fr;
	}
}
</style>
