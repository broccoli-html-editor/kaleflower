const fs = require('fs');
const path = require('path');

// ファイルパスの定義
const templatePath = path.join(__dirname, 'image', 'template.xml');
const jsPath = path.join(__dirname, 'tmpDist', 'image.js');
const outputPath = path.join(__dirname, '..', '..', 'data', 'system_fields_image.xml');

try {
    // template.xml を読み込み
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // image.js を読み込み
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    
    // JSコードからIIFE（即座に実行される関数式）を取り除き、内容だけを抽出
    const cleanJsContent = jsContent.replace(/^\(\(\)\=\>\{/, '').replace(/\}\)\(\);$/, '');
    
    // XMLテンプレート内の {{___bindOnloadFunction___}} を JavaScript コードで置き換え
    const result = templateContent.replace('{{___bindOnloadFunction___}}', cleanJsContent);
    
    // 結果を data/system_fields_image.xml に保存
    fs.writeFileSync(outputPath, result, 'utf8');
    
    console.log('✓ system_fields_image.xml が正常に生成されました');
} catch (error) {
    console.error('エラーが発生しました:', error.message);
    process.exit(1);
}