/**
 * Для выполнения задания нужно установить Node JS (делается быстро и просто)
 * 
 * 
 * Дан список городов. Код для их получения в переменную написан. Вам нужно написать программу, которая будет выполняться следующим образом:
 * node ./cities.js "all where %number%>5" - выведет все города из списка с полем number у объектов городов которые соответствуют условию (вместо number могут быть region и city)
 * 
 * первое слово указывает максимальное количиство или позицию (Для first и second выводится одна запись) - all - все, first - первый, last - последний, цифра - количество, например
 * node ./cities.js "3 where %number%>5" - выведет в консоль 3 записи
 * node ./cities.js "first where %number%>5" - выведет в консоль первую запись
 * 
 * если слова where нет, например:
 * node ./cities.js "all"
 * то вывод работает без фильтрации, в примере выше выведутся в консоль все города.
 * Для удобства разбора (парсинга) строки с запросом рекомендую использовать regex
 * если задан неверный запрос (в примере ниже пропущено слово where но присутствует условие) выводится ошибка: wrong query
 * node ./cities.js "all %number%>5"
 * 
 * Операции для запроса могут быть: больше (>), меньше (<), совпадает (=)
 * 
 * 
 *  
 * ОТВЕТ ВЫВОДИТЬ В КОНСОЛЬ И ПИСАТЬ В ФАЙЛ OUTPUT.JSON (каждый раз перезаписывая)
 */

//Путь к файлу с городами
const LIST_OF_CITIES = "./cities.json";
const LIST_OF_OUTPUT = "./output.json";

// Пакет node для чтения из файла
const fs = require("fs");
const { exception, count } = require("console");
const { strict } = require("assert");
// тут мы получаем "запрос" из командной строки
const query = process.argv[2];

let cities = {};
//Проверяю регулярным выражением  есть ли хотя бы первое слово, означающее количество
function parseQuery(consoleArg)
{
    let reg =/([\d]+|first|last|all)([\s]where[\s]%(number|city|region)%(>|<|=)([\D]+|[\d]+))?/i;
    let arr = consoleArg.match(reg);
    if(!!arr)
    {
        let firstTypeErrorNumber=(String(arr[1])).length;
        if(((String(consoleArg).substring(Number(firstTypeErrorNumber)+1,Number(firstTypeErrorNumber)+6))===String('where')) || (consoleArg == arr[1]))
        {
            return arr;
        }
        else
        {
            console.log('второе слово не where или первое неверное');
            throw 'wrong query';
        }
    }
    else 
    {
        console.log('Пустой запрос');
        throw 'wrong query';
    }
    
}
//если слово есть, то проверяю, есть ли вторая часть запроса
async function checkError()
{
    let keyWord= await parseQuery(query);
    if(!!keyWord)
    {
        if(!!keyWord[1] && !!keyWord[2])
        {
            let select = {
                count: keyWord[1],
                filter : {
                    propertyToCompare: keyWord[3],
                    compareSymbol:keyWord[4],
                    valueToCompare: keyWord[5]
                }
            }
            return select;
        }
        else
        {
            console.log('ошибка после первого слова 1');
            throw 'wrong query';
        }
    }
    else
    {
        console.log('ошибка после первого слова 2');
        throw 'wrong query';
    }
}
//если выражение составлено верно, выполняем его условия
function completeCompare (tokens,cities)
{
    let startPostion=0;
    if( tokens.count==='first')
    {
        tokens.count=1;
    }
    else if(tokens.count==='all')
    {
        tokens.count=cities.length;
    }
    if(Number(tokens.count)>0 || tokens.count=='last')
    {
        let res;
        if(tokens.filter.propertyToCompare==='number')
        {
            
            switch (tokens.filter.compareSymbol)
            {
                case '>':
                    res=cities.filter((item)=>item.number>tokens.filter.valueToCompare);
                    break;
                case '<':
                    res=cities.filter((item)=>item.number<tokens.filter.valueToCompare);
                    break;
                case '=':
                    res=cities.filter((item)=>item.number==tokens.filter.valueToCompare);
                    break;
                default: console.log('это какое-то недоразумение');break;
            }
            if( tokens.count==='last')
            {
                return res.slice(res.length-1,res.length);
            }
            return res.slice(startPostion,tokens.count);
        }
        else if(tokens.filter.propertyToCompare==='region' || tokens.filter.propertyToCompare==='city')
        {
            switch (tokens.filter.compareSymbol)
            {
                case '>':
                    console.log('нельзя сравнить на > текстовое поле');
                    throw 'нельзя сравнить на > текстовое поле';
                case '<':
                    console.log('нельзя сравнить на < текстовое поле');
                    throw 'нельзя сравнить на < текстовое поле';
                case '=':
                    console.log(tokens.filter.valueToCompare);
                    res=cities.filter((item)=>item[tokens.filter.propertyToCompare]==tokens.filter.valueToCompare);
                    break;
                default: 
                    console.log('это какое-то недоразумение');break;
            }
            if( tokens.count==='last')
            {
                console.log(res.length-1,res.length);
                return res.slice(res.length-1,res.length);
            }
            return res.slice(startPostion,tokens.count);
        }
    }
    else
    {
        console.log('так не должно быть');
        throw 'так не должно быть';
    }
}
//запись в файл
function writeFile(data, file) {
    if(data.length!=0)
    {
        return new Promise((resolve, reject) => {
            fs.writeFile(file, JSON.stringify(data), "utf8", (error) => {
                if (error) reject(error);
                resolve(data);
            });
        });
    }
    else
    {
        console.log('Таких данных нет');
        throw 'ошибка';
    }
  }
// Чтение городов в переменную, запись в переменную производится в Callback-функции
fs.readFile(LIST_OF_CITIES, "utf8", (err, data) => {
    cities = data;
    cities = JSON.parse(cities);
    checkError()
                .then((tokens) =>  tokens )
                .then( (tokens) => completeCompare(tokens,cities) )
                .then((tokens)=>{writeFile(tokens,LIST_OF_OUTPUT);console.log(tokens);})
                .catch( () => { console.log("wrong query") ; } );
});

