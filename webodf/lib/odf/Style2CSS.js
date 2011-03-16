/*global odf*/
/**
 * @constructor
 */
odf.Style2CSS = function Style2CSS() {
    // helper constants
    var xlinkns = 'http://www.w3.org/1999/xlink',
        drawns = "urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
        fons = "urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
        officens = "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
        presentationns = "urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
        stylens = "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
        svgns = "urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0",
        tablens = "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
        textns = "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
        namespaces = {
            draw: drawns,
            fo: fons,
            office: officens,
            presentation: presentationns,
            style: stylens,
            svg: svgns,
            table: tablens,
            text: textns,
            xlink: xlinkns
        },

        familynamespaceprefixes = {
            graphic: 'draw',
            paragraph: 'text',
            presentation: 'presentation',
            ruby: 'text',
            section: 'text',
            table: 'table',
            'table-cell': 'table',
            'table-column': 'table',
            'table-row': 'table',
            text: 'text'
        },

        familytagnames = {
            graphic: ['circle', 'connected', 'control', 'custom-shape',
                'ellipse', 'frame', 'g', 'line', 'measure', 'page',
                'page-thumbnail', 'path', 'polygon', 'polyline', 'rect',
                'regular-polygon' ],
            paragraph: ['alphabetical-index-entry-template', 'h',
                'illustration-index-entry-template', 'index-source-style',
                'object-index-entry-template', 'p',
                'table-index-entry-template', 'table-of-content-entry-template',
                'user-index-entry-template'],
            presentation: ['caption', 'circle', 'connector', 'control',
                'custom-shape', 'ellipse', 'frame', 'g', 'line', 'measure',
                'page-thumbnail', 'path', 'polygon', 'polyline', 'rect',
                'regular-polygon'],
            ruby: ['ruby', 'ruby-text'],
            section: ['alphabetical-index', 'bibliography',
                'illustration-index', 'index-title', 'object-index', 'section',
                'table-of-content', 'table-index', 'user-index'],
            table: ['background', 'table'],
            'table-cell': ['body', 'covered-table-cell', 'even-columns',
                'even-rows', 'first-column', 'first-row', 'last-column',
                'last-row', 'odd-columns', 'odd-rows', 'table-cell'],
            'table-column': ['table-column'],
            'table-row': ['table-row'],
            text: ['a', 'index-entry-chapter', 'index-entry-link-end',
                'index-entry-link-start', 'index-entry-page-number',
                'index-entry-span', 'index-entry-tab-stop', 'index-entry-text',
                'index-title-template', 'linenumbering-configuration',
                'list-level-style-number', 'list-level-style-bullet',
                'outline-level-style', 'span']
        },

        textPropertySimpleMapping = [
            [ fons, 'color', 'color' ],
            // this sets the element background, not just the text background
            [ fons, 'background-color', 'background-color' ],
            [ fons, 'font-weight', 'font-weight' ],
            [ fons, 'font-style', 'font-style' ],
            [ fons, 'font-size', 'font-size' ]
        ],

        bgImageSimpleMapping = [
            [ stylens, 'repeat', 'background-repeat' ]
        ],

        paragraphPropertySimpleMapping = [
            [ fons, 'background-color', 'background-color' ],
            [ fons, 'text-align', 'text-align' ],
            [ fons, 'padding-left', 'padding-left' ],
            [ fons, 'padding-right', 'padding-right' ],
            [ fons, 'padding-top', 'padding-top' ],
            [ fons, 'padding-bottom', 'padding-bottom' ],
            [ fons, 'border-left', 'border-left' ],
            [ fons, 'border-right', 'border-right' ],
            [ fons, 'border-top', 'border-top' ],
            [ fons, 'border-bottom', 'border-bottom' ],
            [ fons, 'margin-left', 'margin-left' ],
            [ fons, 'margin-right', 'margin-right' ],
            [ fons, 'margin-top', 'margin-top' ],
            [ fons, 'margin-bottom', 'margin-bottom' ],
            [ fons, 'border', 'border' ]
        ],
        
        graphicPropertySimpleMapping = [
            [ drawns, 'fill-color', 'background-color' ],
            [ drawns, 'fill', 'background' ],
            [ fons, 'min-height', 'min-height' ],
            [ drawns, 'stroke', 'border' ],
            [ svgns, 'stroke-color', 'border-color' ]
        ],
    
        tablecellPropertySimpleMapping = [
            [ fons, 'background-color', 'background-color' ],
            [ fons, 'border-left', 'border-left' ],
            [ fons, 'border-right', 'border-right' ],
            [ fons, 'border-top', 'border-top' ],
            [ fons, 'border-bottom', 'border-bottom' ]
        ];
    
    // helper functions
    /**
     * @param {string} prefix
     * @return {string}
     */
    function namespaceResolver(prefix) {
        return namespaces[prefix];
    }
    this.getStyleFamily = (function () {
        var map = {};
        // invert familytagnames
    }());
    /**
     * @param {!Document} doc
     * @param {!Element} stylesnode
     * @return {!Object}
     */
    function getStyleMap(doc, stylesnode) {
        // put all style elements in a hash map by family and name
        var stylemap = {}, iter, node, name, family;
        if (!stylesnode) {
            return stylemap;
        }
        node = stylesnode.firstChild;
        while (node) {
            if (node.namespaceURI === stylens && node.localName === 'style') {
                name = node.getAttributeNS(stylens, 'name');
                family = node.getAttributeNS(stylens, 'family');
                if (!stylemap[family]) {
                    stylemap[family] = {};
                }
                stylemap[family][name] = node;
            }
            node = node.nextSibling;
        }
        return stylemap;
    }
    /**
     * @param {?Object} stylestree
     * @param {?string} name
     * @return {?string}
     */
    function findStyle(stylestree, name) {
        if (!name || !stylestree) {
            return null;
        }
        if (stylestree[name]) {
            return stylestree[name];
        }
        var derivedStyles = stylestree.derivedStyles,
            n, style;
        for (n in stylestree) {
            if (stylestree.hasOwnProperty(n)) {
                style = findStyle(stylestree[n].derivedStyles, name);
                if (style) {
                    return style;
                }
            }
        }
        return null;
    }
    /**
     * @param {!string} stylename
     * @param {!Object} stylesmap
     * @param {!Object} stylestree
     * @return {undefined}
     */
    function addStyleToStyleTree(stylename, stylesmap, stylestree) {
        var style = stylesmap[stylename], parentname, parentstyle;
        if (!style) {
            return;
        }
        parentname = style.getAttributeNS(stylens, 'parent-style-name');
        parentstyle = null;
        if (parentname) {
            parentstyle = findStyle(stylestree, parentname);
            if (!parentstyle && stylesmap[parentname]) {
                // parent style has not been handled yet, do that now
                addStyleToStyleTree(parentname, stylesmap, stylestree);
                parentstyle = stylesmap[parentname];
                stylesmap[parentname] = null;
            }
        }
        if (parentstyle) {
            if (!parentstyle.derivedStyles) {
                parentstyle.derivedStyles = {};
            }
            parentstyle.derivedStyles[stylename] = style;
        } else {
            // no parent so add the root
            stylestree[stylename] = style;            
        }
    }
    /**
     * @param {!Object} stylesmap
     * @param {!Object} stylestree
     * @return {undefined}
     */
    function addStyleMapToStyleTree(stylesmap, stylestree) {
        var name;
        for (name in stylesmap) {
            if (stylesmap.hasOwnProperty(name)) {
                addStyleToStyleTree(name, stylesmap, stylestree);
                stylesmap[name] = null;
            }
        }
    }
    /**
     * @param {!string} family
     * @param {!string} name
     * @return {?string}
     */
    function createSelector(family, name) {
        var prefix = familynamespaceprefixes[family],
            namepart,
            selector = "",
            first = true;
        if (prefix === null) {
            return null;
        }
        namepart = '[' + prefix + '|style-name="' + name + '"]';
        if (prefix === 'presentation') {
            prefix = 'draw';
            namepart = '[presentation|style-name="' + name + '"]';
        }
        return prefix + '|' + familytagnames[family].join(
                namepart + ',' + prefix + '|') + namepart;
    }
    /**
     * @param {!string} family
     * @param {!string} name
     * @param {!Element} node
     * @return {!Array}
     */
    function getSelectors(family, name, node) {
        var selectors = [], n, ss, s;
        selectors.push(createSelector(family, name));
        for (n in node.derivedStyles) {
            if (node.derivedStyles.hasOwnProperty(n)) {
                ss = getSelectors(family, n, node.derivedStyles[n]);
                for (s in ss) {
                    if (ss.hasOwnProperty(s)) {
                        selectors.push(ss[s]);
                    }
                }
            }
        }
        return selectors;
    }
    /**
     * @param {?Element} node
     * @param {!string} ns
     * @param {!string} name
     * @return {?Element}
     */
    function getDirectChild(node, ns, name) {
        if (!node) {
            return null;
        }
        var c = node.firstChild, e;
        while (c) {
            if (c.namespaceURI === ns && c.localName === name) {
                e = /**@type{Element}*/(c);
                return e;
            }
            c = c.nextSibling;
        }
        return null;
    }
    /**
     * @param {!Element} props
     * @param {!Object} mapping
     * @return {!string}
     */
    function applySimpleMapping(props, mapping) {
        var rule = '', r, value;
        for (r in mapping) {
            if (mapping.hasOwnProperty(r)) {
                r = mapping[r];
                value = props.getAttributeNS(r[0], r[1]);
                if (value) {
                    rule += r[2] + ':' + value + ';';
                }
            }
        }
        return rule;
    }
    /**
     * @param {!string} name
     * @return {!string}
     */
    function getFontDeclaration(name) {
        return '"' + name + '"';
    }
    /**
     * @param {!Element} props
     * @return {!string}
     */
    function getTextProperties(props) {
        var rule = '', value;
        rule += applySimpleMapping(props, textPropertySimpleMapping);
        value = props.getAttributeNS(stylens, 'text-underline-style');
        if (value === 'solid') {
            rule += 'text-decoration: underline;';
        }
        value = props.getAttributeNS(stylens, 'font-name');
        if (value) {
            value = getFontDeclaration(value);
            if (value) {
                rule += 'font-family: ' + value + ';';
            }
        }
        return rule;
    }
    /**
     * @param {!Element} props
     * @return {!string}
     */
    function getParagraphProperties(props) {
        var rule = '', imageProps, url, element;
        rule += applySimpleMapping(props, paragraphPropertySimpleMapping);
        imageProps = props.getElementsByTagNameNS(stylens, 'background-image');
        if (imageProps.length > 0) {
            url = imageProps.item(0).getAttributeNS(xlinkns, 'href');
            if (url) {
                rule += "background-image: url('odfkit:" + url + "');";
                //rule += "background-repeat: repeat;"; //FIXME test
                element = /**@type{!Element}*/(imageProps.item(0));
                rule += applySimpleMapping(element, bgImageSimpleMapping);
            }
        }
        return rule;
    }
    /**
     * @param {!Element} props
     * @return {!string}
     */
    function getGraphicProperties(props) {
        var rule = '';
        rule += applySimpleMapping(props, graphicPropertySimpleMapping);
        return rule;
    }
    /**
     * @param {!Element} props
     * @return {!string}
     */
    function getTableCellProperties(props) {
        var rule = '';
        rule += applySimpleMapping(props, tablecellPropertySimpleMapping);
        return rule;
    }
    /**
     * @param {!StyleSheet} sheet
     * @param {!string} family
     * @param {!string} name
     * @param {!Element} node
     * @return {undefined}
     */
    function addRule(sheet, family, name, node) {
        var selectors = getSelectors(family, name, node),
            selector = selectors.join(','),
            rule = '',
            properties = getDirectChild(node, stylens, 'text-properties');
        if (properties) {
            rule += getTextProperties(properties);
        }
        properties = getDirectChild(node, stylens, 'paragraph-properties');
        if (properties) {
            rule += getParagraphProperties(properties);
        }
        properties = getDirectChild(node, stylens, 'graphic-properties');
        if (properties) {
            rule += getGraphicProperties(properties);
        }
        properties = getDirectChild(node, stylens, 'table-cell-properties');
        if (properties) {
            rule += getTableCellProperties(properties);
        }
        if (rule.length === 0) {
            return;
        }
        rule = selector + '{' + rule + '}';
        try {
            sheet.insertRule(rule, sheet.cssRules.length);
        } catch (e) {
            throw e;
        }
    }
    /**
     * @param {!StyleSheet} sheet
     * @param {!string} family
     * @param {!string} name
     * @param {!Element} node
     * @return {undefined}
     */
    function addRules(sheet, family, name, node) {
        addRule(sheet, family, name, node);
        var n;
        for (n in node.derivedStyles) {
            if (node.derivedStyles.hasOwnProperty(n)) {
                addRules(sheet, family, n, node.derivedStyles[n]);
            }
        }
    }

    // css vs odf styles
    // ODF styles occur in families. A family is a group of odf elements to
    // which an element applies. ODF families can be mapped to a group of css
    // elements

    this.namespaces = namespaces;
    this.namespaceResolver = function (prefix) {
        return namespaces[prefix];
    };

    /**
     * @param {!StyleSheet} stylesheet
     * @param {!Element} styles
     * @param {!Element} autostyles
     * @return {undefined}
     */ 
    this.style2css = function (stylesheet, styles, autostyles) {
        var doc, prefix, styletree, tree, name, rule, family,
            stylenodes, styleautonodes;
        // make stylesheet empty
        while (stylesheet.cssRules.length) {
            stylesheet.deleteRule(stylesheet.cssRules.length - 1);
        }
        doc = null;
        if (styles) {
            doc = styles.ownerDocument;
        }
        if (autostyles) {
            doc = autostyles.ownerDocument;
        }
        if (!doc) {
            return;
        }
        // add @namespace rules
        for (prefix in namespaces) {
            if (namespaces.hasOwnProperty(prefix)) {
                rule = '@namespace ' + prefix + ' url(' + namespaces[prefix] + ')';
                try {
                    stylesheet.insertRule(rule, stylesheet.cssRules.length);
                } catch (e) {
                    // WebKit can throw an exception here, but it will have
                    // retained the namespace declarations anyway.
                }
            }
        }
        
        // add the various styles
        stylenodes = getStyleMap(doc, styles);
        styleautonodes = getStyleMap(doc, autostyles);
        styletree = {}; 
        for (family in familynamespaceprefixes) {
            if (familynamespaceprefixes.hasOwnProperty(family)) {
                tree = styletree[family] = {};
                addStyleMapToStyleTree(stylenodes[family], tree);
                addStyleMapToStyleTree(styleautonodes[family], tree);
    
                for (name in tree) {
                    if (tree.hasOwnProperty(name)) {
                        addRules(stylesheet, family, name, tree[name]);
                    }
                }
            }
        }
    };
};
