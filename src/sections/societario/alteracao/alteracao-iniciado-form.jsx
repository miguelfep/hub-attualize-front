import { AlteracaoFormWizard } from "./alteracao-form-wizard";

export default function AlteracaoIniciadoForm({ currentAlteracao = {}, handleAdvanceStatus }) {

    return (
            <AlteracaoFormWizard alteracaoData={currentAlteracao} />
    )
}
