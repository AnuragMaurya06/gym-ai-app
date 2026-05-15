import { Suspense } from 'react';
import ToolsContent from './ToolsContent';

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
        <div style={{fontSize: '24px', fontWeight: 'bold'}}>Loading Tools... ⏳</div>
      </div>
    }>
      <ToolsContent />
    </Suspense>
  );
}