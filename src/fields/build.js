const fs = require('fs');
const path = require('path');

const buildField = (fieldName) => {
    // ファイルパスの定義
    const templatePath = path.join(__dirname, fieldName, 'template.xml');
    const jsPath = path.join(__dirname, 'tmpDist', fieldName+'.js');
    const outputPath = path.join(__dirname, '..', '..', 'data', 'system_fields_'+fieldName+'.xml');

    try {
        // template.xml を読み込み
        const templateContent = fs.readFileSync(templatePath, 'utf8');

        // js を読み込み
        const jsContent = fs.readFileSync(jsPath, 'utf8');

        // JSコードからIIFE（即座に実行される関数式）を取り除き、内容だけを抽出
        const cleanJsContent = jsContent.replace(/^\(\(\)\=\>\{/, '').replace(/\}\)\(\);$/, '');

        // XMLテンプレート内の {{___bindOnloadFunction___}} を JavaScript コードで置き換え
        const result = templateContent.replace('{{___bindOnloadFunction___}}', cleanJsContent);

        // 結果を data/ に保存
        fs.writeFileSync(outputPath, result, 'utf8');

        console.log('✓ system_fields_'+fieldName+'.xml was generated successfully.');
    } catch (error) {
        console.error('An error has occurred:', error.message);
        process.exit(1);
    }
};

buildField('image');
