import { Router } from 'express';
import { handleVerifyReference, handleScanReferences } from './referenceVerifier';
import { handlePolish } from './prosePolisher';
import { handleContextualSynonyms } from './contextualSynonyms';
import { handleRecommendJournals, handlePeerReview, handleFormatCitationAI } from './copilotService';
import { handleCoachReview } from './coachService';
import { handleMultiTurnChat } from './chatService';
import { 
  handleGenerateDirections, 
  handleChangeTitle, 
  handleChangeRQ, 
  handleCheckAlignment,
  handleCheckEltAlignment
} from './suggestorService';

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
