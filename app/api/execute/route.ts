import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_JUDGE0_URL = 'https://ce.judge0.com/submissions?base64_encoded=false&wait=true';

const LANGUAGE_MAP: Record<string, number> = {
    'python': 71,
    'c': 50,
    'cpp': 54,
    'java': 62
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { source_code, language, stdin } = body;

        const language_id = LANGUAGE_MAP[language.toLowerCase()];

        if (!language_id) {
            return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
        }

        const targetUrl = 'https://ce.judge0.com/submissions?base64_encoded=true&wait=true';

        console.log('Executing Public Judge0 (Base64) for:', language);

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source_code: Buffer.from(source_code).toString('base64'),
                language_id,
                stdin: Buffer.from(stdin || '').toString('base64')
            })
        });

        const status = response.status;
        const resData = await response.json();

        if (!response.ok) {
            console.error('Public Judge0 Error Response:', status, resData);
            return NextResponse.json({ error: 'Public Judge0 API Error', status, details: resData }, { status });
        }

        // Decode the results
        const decode = (str: string | null) => str ? Buffer.from(str, 'base64').toString('utf8') : null;

        return NextResponse.json({
            ...resData,
            stdout: decode(resData.stdout),
            stderr: decode(resData.stderr),
            compile_output: decode(resData.compile_output),
            message: decode(resData.message)
        });
    } catch (error: any) {
        console.error('Execution API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
