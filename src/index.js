"use strict";
import Client from './class/Notion/Client.js';
import Colors from './class/Notion/Colors.js';
import Icons from './class/Notion/Icons.js';
import HeadingType from './class/Blocks/HeadingType.js';
import Heading from './class/Blocks/Heading.js';
import Divider from './class/Blocks/Divider.js';
import Paragraph from './class/Blocks/Paragraph.js';
import PageBuilder from './class/PageBuilder.js';
import ColumnsList from './class/Blocks/ColumnsList.js';
import Columns from './class/Blocks/Columns.js';
import Markdown from './class/Blocks/Markdown.js';
import Callout from './class/Blocks/Callout.js';
import List from './class/Blocks/List.js';
import ListItem from './class/Blocks/ListItem.js';
import ListStyle from './class/Blocks/ListStyle.js';
import Quote from './class/Blocks/Quote.js';
import Code from './class/Blocks/Code.js';
import Languages from './class/Notion/Languages.js';
import Table from './class/Blocks/Table.js';
import Row from './class/Blocks/Row.js';
import Cell from './class/Blocks/Cell.js';

export { Client, Colors,  Icons, HeadingType, Heading, Divider, Paragraph, PageBuilder, ColumnsList, Columns, Markdown, Callout, List, ListItem, ListStyle, Quote, Code, Languages, Table, Row, Cell }

export default class Notion {
    /**
     * Core client for communicating with the Notion API.
     * Manages authentication, requests, and data parsing.
     * @type {typeof Client}
     * @static
     */
    static Client = Client;
    /**
     * Collection of color available in Notion.
     * @type {Colors}
     */
    static Colors = Colors;
    /**
     * Collection of icons available in Notion.
     * @type {Icons}
     */
    static Icons = Icons;
    /**
     * Collection of languages supported by Notion.
     * @type {Languages}
     */
    static Languages = Languages;

    static HeadingType = HeadingType;
    static ListStyle = ListStyle;

    static PageBuilder = PageBuilder;

    static Callout = Callout;
    static Code = Code;
    static Columns = Columns;
    static ColumnsList = ColumnsList;
    static Divider = Divider;
    static Heading = Heading;
    static List = List;
    static ListItem = ListItem;
    static Markdown = Markdown;
    static Paragraph = Paragraph;
    static Quote = Quote;
    static Table = Table;
    static Row = Row;
    static Cell = Cell;
}