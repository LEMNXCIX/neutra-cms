import type { Schema, Struct } from '@strapi/strapi';

export interface SharedFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_faq_items';
  info: {
    description: 'Question and answer pair';
    displayName: 'FAQ item';
  };
  attributes: {
    answer: Schema.Attribute.Blocks;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedFeature extends Struct.ComponentSchema {
  collectionName: 'components_shared_features';
  info: {
    description: 'Home features grid item';
    displayName: 'Feature';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Enumeration<
      ['truck', 'shield', 'tag', 'heart', 'box', 'zap']
    > &
      Schema.Attribute.DefaultTo<'box'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: 'Rich text block (Strapi blocks format)';
    displayName: 'Rich text';
  };
  attributes: {
    content: Schema.Attribute.Blocks;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'shared.faq-item': SharedFaqItem;
      'shared.feature': SharedFeature;
      'shared.rich-text': SharedRichText;
    }
  }
}
