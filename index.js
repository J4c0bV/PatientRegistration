const inquirer = require('inquirer')
const chalk = require('chalk')

const fs = require('fs')

const { error } = require('console')

operation()

function operation() {
    inquirer
        .prompt([{
            type: "list",
            name: "response",
            message: "Qual operaçaõ você deseja ?",
            choices: [
                'Entrada de Paciente',
                'Atualização de Paciente',
                'Retirada de Paciente',
                'Ver Paciente',
                'Sair',
            ],
        },
        ]).then((answer) => {
            const responseOperation = answer["response"]

            if(responseOperation === 'Entrada de Paciente'){
                addPatient();
            }else if(responseOperation === 'Atualização de Paciente'){
                update()
            }else if(responseOperation === 'Retirada de Paciente'){
                deleted()
            }else if(responseOperation === 'Ver Paciente'){
                viewPatient()
            }else if(responseOperation === 'Sair'){
                console.log(chalk.bgGreenBright.black("Obrigado por utilizar o nosso software"))
                process.exit()
            }
        })
}

function addPatient(){
    console.log("Faça o registro do paciente")

    buildPatient()
}

function buildPatient(){
    inquirer.prompt([
    {
        name : 'patientName',
        message : 'Informe o nome do paciente'
    },
    ]).then((answer) => {
        const patientName = answer['patientName']

        if(!fs.existsSync('Patients')){
            fs.mkdirSync('Patients')
        }

        if(fs.existsSync(`Patients/${patientName}.json`)){
            console.log(chalk.bgRed.black("O paciente já está registrado, tente novamente"));
            buildPatient()
        }

        fs.writeFile(`Patients/${patientName}.json`,`{"name":"${patientName}","symptom": "", "deleted": "false"} `, (err) =>{
            console.log(err)
        },
        )

        console.log(chalk.bgBlue.black('Paciente registrado com sucesso'))
        operation()
    })
}

function update(){
    inquirer.prompt([
        {
            name : 'patientName',
            message: 'Qual paciente deseja fazer a alteração ?'
        },
    ]).then((answer)=>{
        const patientName = answer['patientName']

        if(checksPatient(patientName)){
            return update()
        }
        
        inquirer.prompt([
            {
                name: 'patientSymtoms',
                message : 'Qual o sintoma desse paciente ?'
            },
        ]).then((answer) => {
            const patientSymtoms = answer['patientSymtoms']

            addSymtom(patientName,patientSymtoms)

            operation()
        })
    })
}

function checksPatient(patientName) {
    if(!fs.existsSync(`Patients/${patientName}.json`)){
        console.log(chalk.bgRed.black("Paciente não encontrado"));
        return true
    }
    return false
}

function findPatient(patientName){
    const patientData = fs.readFileSync(`./Patients/${patientName}.json`, {
        encoding: 'utf8',
        flag: 'r',
    });
    const patient = JSON.parse(patientData);
    return patient;
}

function addSymtom(patientName,patientSymtoms){
    const patientData = findPatient(patientName)

    if(!patientData){
        console.log(chalk.bgRed.black("Aconteceu um erro, tente novamente !"))

        update();
    }

    patientData.symptom = patientSymtoms

    fs.writeFileSync(`Patients/${patientName}.json`, JSON.stringify(patientData), (err) =>
    {
        console.log(err)
    })

    console.log(chalk.bgGreen.black(`Atualização feita no registro do paciente: ${patientName}`))

}

function deleted(){
    inquirer.prompt([{
        name : "patientName",
        message: "Escreva o nome do paciente que deseja remover: "
    },
    ]).then((answer) =>{
        const patientName = answer['patientName']

        if(checksPatient(patientName)){
            return removePatient()
        }
        removePatient(patientName)

        operation()
    })
}

function removePatient(patientName){
    const patientData = findPatient(patientName)

    if(!patientData){
        console.log(chalk.bgRed.black("Aconteceu um erro, tente novamente !"))

        update();
    }

    patientData.deleted = "true"

    fs.writeFileSync(`Patients/${patientName}.json`,JSON.stringify(patientData), (err)=>{
        console.log(err)
    })

    console.log(chalk.bgGreen.black(`Deleção feita no registro do paciente: ${patientName}`))
}

function viewPatient(){
    inquirer.prompt([{
        name : 'patientName',
        message : 'Qual é o nome do paciente que deseja vizualizar ?'
    }]).then((answer) =>{
        const patientName = answer['patientName']
        checksPatient(patientName)
        const patientData = findPatient(patientName)

        if(!patientData.deleted){
            console.log("O paciente não está mais no sistema")
            return viewPatient()
        }

        console.log(chalk.bgBlue.black('Informações do paciente'))
        console.log(`Nome: ${patientData.name} \nSintoma: ${patientData.symptom}`)
        onsole.log(chalk.bgBlue.black(''))
        operation()
    })
}