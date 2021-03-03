import { WordType } from '../WordType';
import { createLexer, Token } from './syntaxParser';

export const lexer = createLexer([
  {
    type: WordType.connector,
    regExps: /^(AND|OR|NOT)/,
  },
  {
    type: WordType.to,
    regExps: /^(to)/i,
  },
  {
    type: WordType.stats,
    regExps: /^(stats)/,
  },
  {
    type: WordType.as,
    regExps: /^(as)/,
  },
  {
    type: WordType.by,
    regExps: /^(by)/,
  },
  {
    type: WordType.sort,
    regExps: /^(sort)/,
  },
  {
    type: WordType.limit,
    regExps: /^(limit)/,
  },
  {
    type: WordType.fields,
    regExps: /^(fields)/,
  },
  {
    type: WordType.aggregation,
    regExps: /^(count|sum|avg|min|max)/,
  },
  {
    type: WordType.numeric,
    regExps: /^(\d+)/,
  },
  {
    type: WordType.asc,
    regExps: /^(\+)/,
  },
  {
    type: WordType.desc,
    regExps: /^(-)/,
  },
  {
    type: WordType.identifier,
    regExps: /^([.0-9a-zA-Z\u4e00-\uffff_@*?-]+)|^(\*)/,
  },
  {
    type: WordType.any,
    regExps: /^(\*)/,
  },
  {
    type: WordType.one,
    regExps: /^(\?)/,
  },
  {
    type: WordType.whitespace,
    regExps: /^(\s+)/,
  },
  {
    type: WordType.assign,
    regExps: /^(=)/,
  },
  {
    type: WordType.quote,
    regExps: /^(")/,
  },
  {
    type: WordType.slash,
    regExps: /^(\/)/,
  },
  {
    type: WordType.pipe,
    regExps: /^(\|)/,
  },
  {
    type: WordType.leftBracket,
    regExps: /^(\()/,
  },
  {
    type: WordType.rightBracket,
    regExps: /^(\))/,
  },
  {
    type: WordType.leftSquareBracket,
    regExps: /^(\[)/,
  },
  {
    type: WordType.rightSquareBracket,
    regExps: /^(\])/,
  },
  {
    type: WordType.leftBrace,
    regExps: /^(\{)/,
  },
  {
    type: WordType.rightBrace,
    regExps: /^(\})/,
  },
  {
    type: WordType.comma,
    regExps: /^(,)/,
  },
]);

type GrammarNodeFactor = () => GrammarNode;

export interface GrammarNode {
  [key: string]: GrammarNodeFactor | undefined;
}

// #region 手动构建的语法树
const commaAndFieldNode: (nextNode?: GrammarNode) => GrammarNode = (
  nextNode = {}
) => ({
  [WordType.identifier]: () => ({
    ...nextNode,
    [WordType.comma]: () => commaAndFieldNode(nextNode),
    [WordType.identifier]: () => ({}),
    [WordType.whitespace]: () => ({}),
  }),
});

const completionNode: (nextNode?: GrammarNode) => GrammarNode = (
  nextNode = {}
) => ({
  [WordType.identifier]: () => nextNode,
});

const groupByNode: () => GrammarNode = () => ({
  [WordType.by]: () => ({
    [WordType.whitespace]: () => ({
      [WordType.identifier]: () => ({
        [WordType.comma]: () => commaAndFieldNode(pipeNode(commandNode())),
        [WordType.whitespace]: () => pipeNode(commandNode()),
        ...commaAndFieldNode(pipeNode(commandNode())),
      }),
    }),
  }),
});

const limitNode: () => GrammarNode = () => ({
  [WordType.limit]: () => ({
    [WordType.whitespace]: () => ({
      [WordType.numeric]: () => ({
        [WordType.whitespace]: () => pipeNode(commandNode()),
      }),
    }),
  }),
});

const commaAndSortField: () => GrammarNode = () => ({
  [WordType.identifier]: () => ({
    [WordType.asc]: () => ({
      [WordType.comma]: () => ({
        ...commaAndSortField(),
        [WordType.whitespace]: () => commaAndSortField(),
      }),
      [WordType.whitespace]: () => pipeNode(commandNode()),
      ...pipeNode(commandNode()),
    }),
    [WordType.desc]: () => ({
      [WordType.comma]: () => ({
        ...commaAndSortField(),
        [WordType.whitespace]: () => commaAndSortField(),
      }),
      [WordType.whitespace]: () => pipeNode(commandNode()),
      ...pipeNode(commandNode()),
    }),
    [WordType.whitespace]: () => pipeNode(commandNode()),
    [WordType.comma]: () => commaAndSortField(),
    [WordType.identifier]: () => ({}),
  }),
});

const sortNode: () => GrammarNode = () => ({
  [WordType.sort]: () => ({
    [WordType.whitespace]: () => ({
      [WordType.by]: () => ({
        [WordType.whitespace]: () => commaAndSortField(),
      }),
    }),
  }),
});

const sourceNode: () => GrammarNode = () => ({
  [WordType.fields]: () => ({
    [WordType.whitespace]: () => ({
      [WordType.leftSquareBracket]: () => ({
        ...commaAndFieldNode({
          [WordType.rightSquareBracket]: () => ({
            [WordType.whitespace]: () => pipeNode(commandNode()),
          }),
        }),
        [WordType.whitespace]: () =>
          commaAndFieldNode({
            [WordType.rightSquareBracket]: () => ({
              [WordType.whitespace]: () => pipeNode(commandNode()),
            }),
          }),
      }),
    }),
  }),
});

const intervalNode: () => GrammarNode = () => ({
  [WordType.leftSquareBracket]: () => ({
    [WordType.numeric]: () => ({
      [WordType.whitespace]: () => ({
        [WordType.to]: () => ({
          [WordType.whitespace]: () => ({
            [WordType.numeric]: () => ({
              [WordType.rightSquareBracket]: () => nextFieldNode(),
              [WordType.rightBrace]: () => nextFieldNode(),
            }),
          }),
        }),
      }),
    }),
  }),
  [WordType.leftBrace]: () => ({
    [WordType.numeric]: () => ({
      [WordType.whitespace]: () => ({
        [WordType.to]: () => ({
          [WordType.whitespace]: () => ({
            [WordType.numeric]: () => ({
              [WordType.rightBrace]: () => nextFieldNode(),
              [WordType.rightSquareBracket]: () => nextFieldNode(),
            }),
          }),
        }),
      }),
    }),
  }),
});

const asNode: () => GrammarNode = () => ({
  [WordType.as]: () => ({
    [WordType.whitespace]: () => ({
      [WordType.identifier]: () => ({
        [WordType.whitespace]: () => ({
          ...pipeNode(commandNode()),
          ...groupByNode(),
        }),
      }),
    }),
  }),
});

const statsNode: () => GrammarNode = () => ({
  [WordType.stats]: () => ({
    [WordType.whitespace]: () => ({
      [WordType.aggregation]: () => ({
        [WordType.leftBracket]: () => ({
          [WordType.identifier]: () => ({
            [WordType.rightBracket]: () => ({
              [WordType.whitespace]: () => ({
                ...pipeNode(commandNode()),
                ...groupByNode(),
                ...asNode(),
              }),
            }),
            ...completionNode(),
          }),
        }),
      }),
    }),
  }),
});

const processNode: () => GrammarNode = () => ({
  ...statsNode(),
});

const commandNode: () => GrammarNode = () => ({
  ...sortNode(),
  ...limitNode(),
  ...sourceNode(),
});

const pipeNode: (nextNode?: GrammarNode) => GrammarNode = (nextNode = {}) => ({
  [WordType.pipe]: () => ({
    [WordType.whitespace]: () => nextNode,
    ...nextNode,
  }),
});

const valueNode: (nextNode?: GrammarNode) => GrammarNode = (nextNode = {}) => ({
  [WordType.identifier]: () => ({
    ...nextFieldNode(nextNode),
    [WordType.any]: () => nextFieldNode(nextNode),
    [WordType.one]: () => nextFieldNode(nextNode),
  }),
  ...nextNode,
});

const connecterNode: (nextNode?: GrammarNode) => GrammarNode = (
  nextNode = {}
) => ({
  [WordType.connector]: () => ({
    [WordType.whitespace]: () => ({
      ...fieldNode(),
      ...quoteNode(),
      ...slashNode(),
      ...leftBracketNode(),
      ...nextNode,
    }),
  }),
});

const leftBracketNode: () => GrammarNode = () => ({
  [WordType.leftBracket]: () => ({
    ...leftBracketNode(),
    ...fieldNode(rightBracketNode()),
    ...quoteNode(rightBracketNode()),
    ...slashNode(rightBracketNode()),
  }),
});

const rightBracketNode: () => GrammarNode = () => ({
  [WordType.rightBracket]: () => ({
    ...nextFieldNode(rightBracketNode()),
  }),
});

const nextQuoteNode: (nextNode?: GrammarNode) => GrammarNode = (
  nextNode = {}
) => ({
  [WordType.whitespace]: () => ({
    [WordType.identifier]: () => ({
      [WordType.quote]: () => nextFieldNode(nextNode),
      ...nextQuoteNode(nextNode),
    }),
    [WordType.quote]: () => nextFieldNode(nextNode),
  }),
  ...nextNode,
});

const quoteNode: (nextNode?: GrammarNode) => GrammarNode = (nextNode = {}) => ({
  [WordType.quote]: () => ({
    [WordType.quote]: () => nextFieldNode(nextNode),
    [WordType.identifier]: () => ({
      ...nextQuoteNode(),
      [WordType.quote]: () => nextFieldNode(nextNode),
    }),
    ...nextQuoteNode(nextNode),
  }),
  ...nextNode,
});

const nextSlashNode: (nextNode?: GrammarNode) => GrammarNode = (
  nextNode = {}
) => ({
  [WordType.whitespace]: () => ({
    [WordType.identifier]: () => ({
      [WordType.slash]: () => nextSlashNode(nextNode),
      ...nextSlashNode(nextNode)
    }),
    [WordType.slash]: () => nextSlashNode(nextNode),
  }),
  ...nextNode
})

const slashNode: (nextNode?: GrammarNode) => GrammarNode = (nextNode = {}) => ({
  [WordType.slash]: () => ({
    [WordType.identifier]: () => ({
      ...nextSlashNode(),
      [WordType.slash]: () => nextSlashNode(nextNode),
    }),
    ...nextSlashNode(nextNode),
  }),
  ...nextNode
})

const nextFieldNode: (nextNode?: GrammarNode) => GrammarNode = (
  nextNode = {}
) => ({
  [WordType.whitespace]: () => ({
    ...fieldNode(nextNode),
    ...connecterNode(nextNode),
    ...quoteNode(nextNode),
    ...slashNode(nextNode),
    ...pipeNode({
      ...processNode(),
      ...commandNode(),
    }),
    ...leftBracketNode(),
    ...nextNode,
  }),
  ...pipeNode({
    ...processNode(),
    ...commandNode(),
  }),
  ...nextNode,
});

const fieldNode: (nextNode?: GrammarNode) => GrammarNode = (nextNode = {}) => ({
  [WordType.identifier]: () => ({
    [WordType.assign]: () => ({
      ...intervalNode(),
      ...quoteNode(nextNode),
      ...slashNode(nextNode),
      ...valueNode(nextNode),
      [WordType.any]: () => nextFieldNode(nextNode),
      [WordType.one]: () => nextFieldNode(nextNode),
    }),
    ...completionNode(),
    ...nextFieldNode(nextNode),
    ...nextNode,
  }),
});

const searchAllNode: () => GrammarNode = () => ({
  [WordType.any]: () => ({
    [WordType.whitespace]: () =>
      pipeNode({
        ...processNode(),
        ...commandNode(),
      }),
    ...pipeNode({
      ...processNode(),
      ...commandNode(),
    }),
  }),
});

const rootGrammar: GrammarNode = {
  ...fieldNode(),
  ...quoteNode(),
  ...slashNode(),
  ...searchAllNode(),
  ...leftBracketNode(),
  [WordType.whitespace]: () => ({
    ...rootGrammar,
  }),
};
// #endregion

export const FIRST_SUGGESTIONS: WordType[] = [
  WordType.quote,
  WordType.identifier,
  WordType.any,
  WordType.leftBracket,
];

export function tokenize(input: string): Token[] {
  try {
    return lexer(input);
  } catch (e) {
    return [];
  }
}

function getSuggestions(tokens: Token[], grammarNode: GrammarNode): WordType[] {
  if (tokens.length === 0) {
    return [];
  }

  const [head, ...rest] = tokens;
  const factor = grammarNode[head.type];

  if (!factor) {
    return [];
  }

  const nextNode = factor();
  const nextSuggestions = getSuggestions(rest, nextNode);
  if (nextSuggestions.length === 0) {
    return Object.keys(nextNode) as WordType[];
  }

  return nextSuggestions;
}

export function parseToSuggestions(input: string): WordType[] {
  const tokens = tokenize(input);
  if (tokens.length === 0) {
    return FIRST_SUGGESTIONS;
  }

  return getSuggestions(tokens, rootGrammar);
}
