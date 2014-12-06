#include "SENNA_NER.h"
#include "SENNA_utils.h"
#include "SENNA_nn.h"

int* SENNA_NER_forward(SENNA_NER *ner, const int *sentence_words, const int *sentence_caps, 
                                       const int *sentence_gazl,
                                       const int *sentence_gazm,
                                       const int *sentence_gazo,
                                       const int *sentence_gazp,
                                       int sentence_size)
{
  int idx;
  int input_size = ner->ll_word_size+ner->ll_caps_size+ner->ll_gazl_size+ner->ll_gazm_size+ner->ll_gazo_size+ner->ll_gazp_size;

  ner->input_state = SENNA_realloc(ner->input_state, sizeof(float), (sentence_size+ner->window_size-1)*input_size);
  ner->output_state = SENNA_realloc(ner->output_state, sizeof(float), sentence_size*ner->output_state_size);

  SENNA_nn_lookup(ner->input_state,
       input_size, ner->ll_word_weight, ner->ll_word_size, ner->ll_word_max_idx, sentence_words, sentence_size, ner->ll_word_padding_idx, (ner->window_size-1)/2);
  SENNA_nn_lookup(ner->input_state+ner->ll_word_size,
       input_size, ner->ll_caps_weight, ner->ll_caps_size, ner->ll_caps_max_idx, sentence_caps,  sentence_size, ner->ll_caps_padding_idx, (ner->window_size-1)/2);
  SENNA_nn_lookup(ner->input_state+ner->ll_word_size+ner->ll_caps_size,
       input_size, ner->ll_gazl_weight, ner->ll_gazl_size, ner->ll_gazl_max_idx, sentence_gazl,  sentence_size, ner->ll_gazt_padding_idx, (ner->window_size-1)/2);
  SENNA_nn_lookup(ner->input_state+ner->ll_word_size+ner->ll_caps_size+ner->ll_gazl_size,
       input_size, ner->ll_gazm_weight, ner->ll_gazm_size, ner->ll_gazm_max_idx, sentence_gazm,  sentence_size, ner->ll_gazt_padding_idx, (ner->window_size-1)/2);
  SENNA_nn_lookup(ner->input_state+ner->ll_word_size+ner->ll_caps_size+ner->ll_gazl_size+ner->ll_gazm_size,
       input_size, ner->ll_gazo_weight, ner->ll_gazo_size, ner->ll_gazo_max_idx, sentence_gazo,  sentence_size, ner->ll_gazt_padding_idx, (ner->window_size-1)/2);
  SENNA_nn_lookup(ner->input_state+ner->ll_word_size+ner->ll_caps_size+ner->ll_gazl_size+ner->ll_gazm_size+ner->ll_gazo_size,
       input_size, ner->ll_gazp_weight, ner->ll_gazp_size, ner->ll_gazp_max_idx, sentence_gazp,  sentence_size, ner->ll_gazt_padding_idx, (ner->window_size-1)/2);

  for(idx = 0; idx < sentence_size; idx++)
  {
    SENNA_nn_linear(ner->hidden_state, ner->hidden_state_size, ner->l1_weight, ner->l1_bias, ner->input_state+idx*input_size, ner->window_size*input_size);
    SENNA_nn_hardtanh(ner->hidden_state, ner->hidden_state, ner->hidden_state_size);
    SENNA_nn_linear(ner->output_state+idx*ner->output_state_size, ner->output_state_size, ner->l2_weight, ner->l2_bias, ner->hidden_state, ner->hidden_state_size);
  }

  ner->labels = SENNA_realloc(ner->labels, sizeof(int), sentence_size);
  SENNA_nn_viterbi(ner->labels, ner->viterbi_score_init, ner->viterbi_score_trans, ner->output_state, ner->output_state_size, sentence_size);

  return ner->labels;
}

SENNA_NER* SENNA_NER_new(const char *path, const char *subpath)
{
  SENNA_NER *ner = SENNA_malloc(sizeof(SENNA_NER), 1);
  FILE *f;
  float dummy;

  memset(ner, 0, sizeof(SENNA_NER));

  f = SENNA_fopen(path, subpath, "rb");

  SENNA_fread(&ner->window_size, sizeof(int), 1, f);
  SENNA_fread_tensor_2d(&ner->ll_word_weight, &ner->ll_word_size, &ner->ll_word_max_idx, f);
  SENNA_fread_tensor_2d(&ner->ll_caps_weight, &ner->ll_caps_size, &ner->ll_caps_max_idx, f);
  SENNA_fread_tensor_2d(&ner->ll_gazl_weight, &ner->ll_gazl_size, &ner->ll_gazl_max_idx, f);
  SENNA_fread_tensor_2d(&ner->ll_gazm_weight, &ner->ll_gazm_size, &ner->ll_gazm_max_idx, f);
  SENNA_fread_tensor_2d(&ner->ll_gazo_weight, &ner->ll_gazo_size, &ner->ll_gazo_max_idx, f);
  SENNA_fread_tensor_2d(&ner->ll_gazp_weight, &ner->ll_gazp_size, &ner->ll_gazp_max_idx, f);
  SENNA_fread_tensor_2d(&ner->l1_weight, &ner->input_state_size, &ner->hidden_state_size, f);
  SENNA_fread_tensor_1d(&ner->l1_bias, &ner->hidden_state_size, f);
  SENNA_fread_tensor_2d(&ner->l2_weight, &ner->hidden_state_size, &ner->output_state_size, f);
  SENNA_fread_tensor_1d(&ner->l2_bias, &ner->output_state_size, f);
  SENNA_fread_tensor_1d(&ner->viterbi_score_init, &ner->output_state_size, f);
  SENNA_fread_tensor_2d(&ner->viterbi_score_trans, &ner->output_state_size, &ner->output_state_size, f);

  SENNA_fread(&ner->ll_word_padding_idx, sizeof(int), 1, f);
  SENNA_fread(&ner->ll_caps_padding_idx, sizeof(int), 1, f);
  SENNA_fread(&ner->ll_gazt_padding_idx, sizeof(int), 1, f);

  SENNA_fread(&dummy, sizeof(float), 1, f);
  SENNA_fclose(f);

  if((int)dummy != 777)
    SENNA_error("ner: data corrupted (or not IEEE floating computer)");

  ner->input_state = NULL;
  ner->hidden_state = SENNA_malloc(sizeof(float), ner->hidden_state_size);
  ner->output_state = NULL;
  ner->labels = NULL;

  /* some info if you want verbose */
  SENNA_message("ner: window size: %d", ner->window_size);
  SENNA_message("ner: vector size in word lookup table: %d", ner->ll_word_size);
  SENNA_message("ner: word lookup table size: %d", ner->ll_word_max_idx);
  SENNA_message("ner: vector size in caps lookup table: %d", ner->ll_caps_size);
  SENNA_message("ner: caps lookup table size: %d", ner->ll_caps_max_idx);
  SENNA_message("ner: vector size in loc lookup table: %d", ner->ll_gazl_size);
  SENNA_message("ner: loc lookup table size: %d", ner->ll_gazl_max_idx);
  SENNA_message("ner: vector size in misc lookup table: %d", ner->ll_gazm_size);
  SENNA_message("ner: misc lookup table size: %d", ner->ll_gazm_max_idx);
  SENNA_message("ner: vector size in other lookup table: %d", ner->ll_gazo_size);
  SENNA_message("ner: other lookup table size: %d", ner->ll_gazo_max_idx);
  SENNA_message("ner: vector size in loc lookup table: %d", ner->ll_gazl_size);
  SENNA_message("ner: loc lookup table size: %d", ner->ll_gazl_max_idx);
  SENNA_message("ner: number of hidden units: %d", ner->hidden_state_size);
  SENNA_message("ner: number of classes: %d", ner->output_state_size);

  return ner;
}

void SENNA_NER_free(SENNA_NER *ner)
{
  SENNA_free(ner->ll_word_weight);
  SENNA_free(ner->ll_caps_weight);
  SENNA_free(ner->ll_gazl_weight);
  SENNA_free(ner->ll_gazm_weight);
  SENNA_free(ner->ll_gazo_weight);
  SENNA_free(ner->ll_gazp_weight);
  SENNA_free(ner->l1_weight);
  SENNA_free(ner->l1_bias);  
  SENNA_free(ner->l2_weight);
  SENNA_free(ner->l2_bias);
  SENNA_free(ner->viterbi_score_init);
  SENNA_free(ner->viterbi_score_trans);
  
  SENNA_free(ner->input_state);
  SENNA_free(ner->hidden_state);
  SENNA_free(ner->output_state);
  SENNA_free(ner->labels);

  SENNA_free(ner);
}
