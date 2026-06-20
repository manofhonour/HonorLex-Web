import { Router } from 'express';
import { handleVerifyReference, handleScanReferences } from './referenceVerifier.ts';
import { handlePolish } from './prosePolisher.ts';
import { handleContextualSynonyms } from './contextualSynonyms.ts';
import { handleRecommendJournals, handlePeerReview, handleFormatCitationAI } from './copilotService.ts';
import { handleCoachReview } from './coachService.ts';
import { handleMultiTurnChat } from './chatService.ts';
import { 
  handleGenerateDirections, 
  handleChangeTitle, 
  handleChangeRQ, 
  handleCheckAlignment,
  handleCheckEltAlignment
} from './suggestorService.ts';

const router = Router();

router.post('/verify-reference', handleVerifyReference);
router.post('/scan-references', handleScanReferences);
router.post('/polish', handlePolish);
router.post('/contextual-synonyms', handleContextualSynonyms);
router.post('/recommend-journals', handleRecommendJournals);
router.post('/peer-review', handlePeerReview);
router.post('/format-citation-ai', handleFormatCitationAI);
router.post('/coach-review', handleCoachReview);
router.post('/chat', handleMultiTurnChat);

// Topic Suggestor routes
router.post('/suggestor/generate', handleGenerateDirections);
router.post('/suggestor/change-title', handleChangeTitle);
router.post('/suggestor/change-rq', handleChangeRQ);
router.post('/suggestor/check-alignment', handleCheckAlignment);
router.post('/suggestor/check-elt-alignment', handleCheckEltAlignment);

export default router;
