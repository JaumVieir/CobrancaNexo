<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import router from '../router'

const route = useRoute()

const dados = ref(null)
const erro = ref("")
const carregando = ref(true)
const tableContainerRef = ref(null)

const ajustarScrollTabelaParaDireita = async () => {
  await nextTick()
  const tabela = tableContainerRef.value
  if (!tabela) return
  if (tabela.scrollWidth > tabela.clientWidth) {
    tabela.scrollLeft = tabela.scrollWidth
  }
}


onMounted(async () => {
  try {

    const token = route.params.token;
    const sessao = localStorage.getItem(`sessao_${token}`);
    if (!sessao) router.replace(`/cobranca/${token}`);
  

    if (!sessao) {
      erro.value = "Sessão inválida.";
      carregando.value = false;
      return;
    }

    const r = await fetch(`postgres-teste-production.up.railway.app/api/dados?token=${sessao}`);
    
    if(r.status === 401){
      localStorage.removeItem(`sessao_${token}`);
      router.replace(`/cobranca/${token}`);
      return;
    }

    const j = await r.json();
console.log(j);

    if (!r.ok) throw new Error(j?.error || "Erro ao buscar dados.");

    dados.value = j;
    await ajustarScrollTabelaParaDireita();
    const moradorApi = computed(() => dados.value?.morador || null);
    const boletosApi = computed(() => dados.value?.boletos || []);
    dividaTotal = computed(() => Number(dados.value?.dividaTotal) || 0);
  } catch (e) {
    erro.value = e?.message || "Erro inesperado.";
  } finally {
    carregando.value = false;
  }
});

onMounted(() => {
  window.addEventListener('resize', ajustarScrollTabelaParaDireita)
})

onUnmounted(() => {
  window.removeEventListener('resize', ajustarScrollTabelaParaDireita)
})



const moradorApi = computed(() => dados.value?.morador || null);
const boletosApi = computed(() => dados.value?.boletos || []);
const dividaTotal = computed(() => Number(dados.value?.dividaTotal) || 0);
const acordo = computed(() => dados.value?.acordo || null)

const morador = ref({
  nome: moradorApi.value?.titular,
  unidade: moradorApi.value?.unidade,
  cpf: moradorApi.value?.cpf,
})



const debitos = ref([])


const aceitar = () => {
  alert(`Proposta aceita! Entrada: R$ ${entrada.value.toFixed(2)} + 12x de R$ ${parcelasRestante.value.toFixed(2)}`)
}

const formataCpf = (cpf) =>{
  cpf = String(cpf).replace(/\D/g, "")
  return `${cpf.slice(0,3)}.***.***-${cpf.slice(-2)}`;
}

const formatarValor = (valor) => {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
</script>

<template>
  <div class="container">
    <div class="header-box">
      <div class="header-content">
        <div class="morador-info">
          <div class="morador-nome">{{ moradorApi?.titular }}</div>
          <div class="morador-detalhes">
            <span>UNIDADE: {{ moradorApi?.unidade  }}</span>
            <span class="separator">•</span>
            <span>CPF: {{ formataCpf(moradorApi?.cpf)  }}</span>
          </div>
        </div>
        <div class="total-box">
          <div class="label">Detalhamento dos Débitos</div>
          <div class="total-amount">R$ {{ (formatarValor(dividaTotal)) }}</div>
        </div>
      </div>
    </div>

    <!-- Tabela de débitos -->
    <div class="table-container" ref="tableContainerRef">
  <table class="debitos-table">
    <thead>
      <tr>
        <th class="col-vencimento">Vencimento</th>
        <th class="col-competencia">Competência</th>
        <th class="col-original">Original</th>
        <th class="col-juros">Juros</th>
        <th class="col-multa">Multa</th>
        <th class="col-atualizacao">Atualização</th>
        <th class="col-honorarios">Honorários</th>
        <th class="col-total">Total</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(debito, index) in boletosApi" :key="debito.vencimento + '_' + debito.competencia + '_' + index">
        <td class="col-vencimento">{{ debito.vencimento }}</td>
        <td class="col-competencia">{{ debito.competencia }}</td>

        <td class="col-original">R$ {{ formatarValor(debito.original) }}</td>
        <td class="col-juros">R$ {{ formatarValor(debito.juros) }}</td>
        <td class="col-multa">R$ {{ formatarValor(debito.multa) }}</td>
        <td class="col-atualizacao">R$ {{ formatarValor(debito.atualizacao) }}</td>
        <td class="col-honorarios">R$ {{ formatarValor(debito.honorarios) }}</td>
        <td class="col-total" style="font-weight: bold;">R$ {{ formatarValor(debito.total) }}</td>
      </tr>
    </tbody>
  </table>
</div>

    <!-- Footer com Proposta e Informações -->
    <div class="footer-section">
      <!-- Proposta de Acordo (Esquerda) -->
      <div class="acordo-box">
        <div class="acordo-title">Proposta de Acordo</div>
        <div v-if="acordo" class="acordo-content">
          <div class="desconto-info">
            <div class="desconto-label entrada-label">
              <span>{{acordo?.entradaPct}}% de entrada:</span>
              <span class="valor-destaque">R$ {{ formatarValor(acordo?.entrada) }}</span>
            </div>
            <div class="desconto-label restante-label" style="margin-top: 6px; font-size: 13px;">Restante em {{acordo?.parcelas}}x: R$ {{
              formatarValor(acordo?.valorParcelas) }}</div>
          </div>
          <button class="btn-aceitar" @click="aceitar">Enviar Proposta</button>
        </div>
        <div v-else>
          <div class="desconto-label entrada-label">
            <br>
           
              <span>Entre em contato com a NEXO ADMINISTRADORA</span>
              <span class="valor-destaque"> (19) 99258-2535</span>
            </div>
        </div>
      </div>
      <!-- Informações sobre Cobrança (Direita) -->
      <div class="cobranca-info-box">
        <div class="info-title">Informações da Cobrança</div>
        <div class="info-content">
          <div class="info-items-row">
            <div class="info-item">
              <span class="info-label">Unidade:</span>
              <span class="info-value">{{ moradorApi?.unidade }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Quebras:</span>
              <span class="info-value">{{ debitos.length }} registros</span>
            </div>
            <div class="info-item status-juridico">
              <span class="status-badge">Em breve será enviada para o jurídico</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="../assets/cobrancaDetalhes.css" scoped></style>
