<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router';

const API_BASE = "http://localhost:3000"

const route = useRoute()
const router = useRouter()
const token = String(route.params.token || "");

const cpf = ref('')
const erro = ref('')
const carregando = ref(false)
const cpfDigitos = ref(Array(11).fill(''))

const handleCpfInput = (index, event) => {
    let value = event.target.value

    // Apenas números
    value = value.replace(/\D/g, '')

    // Limita a 1 dígito por caixa
    if (value) {
        cpfDigitos.value[index] = value.slice(-1)
        // Move para próxima caixa automaticamente
        if (index < 10) {
            setTimeout(() => {
                const nextInput = document.querySelector(`input[data-index="${index + 1}"]`)
                if (nextInput) nextInput.focus()
            }, 0)
        }
    } else {
        cpfDigitos.value[index] = ''
    }
}

const handleCpfKeyDown = (index, event) => {
    // Backspace
    if (event.key === 'Backspace' && !cpfDigitos.value[index] && index > 0) {
        setTimeout(() => {
            const prevInput = document.querySelector(`input[data-index="${index - 1}"]`)
            if (prevInput) prevInput.focus()
        }, 0)
    }
}

const handlePaste = (event) => {
    event.preventDefault()
    const pastedData = event.clipboardData.getData('text')
    const digitos = pastedData.replace(/\D/g, '').slice(0, 11)

    digitos.split('').forEach((digit, index) => {
        if (index < 11) {
            cpfDigitos.value[index] = digit
        }
    })
}

async function validar() {
    erro.value = "";
    carregando.value = true;

    const cpfCompleto = cpfDigitos.value.join("");

    if (cpfCompleto.length !== 11) {
        alert("CPF incompleto! Digite todos os 11 dígitos.");
        carregando.value = false;
        return;
    }

    if (/^(\d)\1{10}$/.test(cpfCompleto)) {
        alert("CPF inválido!");
        carregando.value = false;
        return;
    }

    try {
        const r = await fetch(`${API_BASE}/api/validar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token, cpf: cpfCompleto }),
        });

        let j;
        try {
            j = await r.json(); 
        } catch {
            const txt = await r.text();
            console.log("Resposta não-JSON:", txt);
            erro.value = "Resposta inválida do servidor.";
            return;
        }
        
        if (!r.ok || !j.ok) {
            alert(j?.error)
            erro.value = j?.error || `Erro ${r.status}`;
            return;
        }

        localStorage.setItem(`sessao_${token}`, j.sessao_token);

        router.push(`/cobrancas/${token}/detalhes`);
    } catch (e) {
        erro.value = "Falha de rede ou API fora do ar.";
    } finally {
        carregando.value = false;
    }
}

const limparCpf = () => {
    cpfDigitos.value = Array(11).fill('')
    document.querySelector('input[data-index="0"]')?.focus()
}
</script>

<template>
    <div class="container">
        <div class="card">
            <!-- Header -->
            <div class="header-box">
               
                <div class="header-title">Validação de CPF</div>
            </div>

            <!-- Input de CPF -->
            <div class="cpf-box">
                <div class="cpf-title">Digite seu CPF</div>

                <div class="cpf-inputs" @paste="handlePaste">
                    <input v-for="(digit, index) in cpfDigitos" :key="index" v-model="cpfDigitos[index]" type="text"
                        :data-index="index" class="cpf-input" inputmode="numeric" maxlength="1"
                        @input="handleCpfInput(index, $event)" @keydown="handleCpfKeyDown(index, $event)" />
                </div>

                <div class="cpf-hint">Copie e cole seu CPF ou digite cada dígito</div>

                <div class="button-group">
                    <button class="btn-validar" @click="validar()">Validar</button>
                    <button class="btn-limpar" @click="limparCpf">Limpar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style src="../assets/cobrancaValidacao.css" scoped></style>
