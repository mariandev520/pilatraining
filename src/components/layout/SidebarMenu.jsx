// src/components/layout/SidebarMenu.jsx
import React from 'react';
import Link from 'next/link';
import { List, ListItem, ListItemIcon, Collapse, Box } from '@mui/material';
import { motion } from 'framer-motion';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { StyledListItemButton, StyledListItemText, menuColors } from './Sidebar.styled';
import { menuItems } from './menuItems';

const itemVariants = {
  hidden: { x: -10, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

export default function SidebarMenu({
  currentPath,
  isMinimized,
  openSubMenu,
  onSubMenuToggle,
}) {
  return (
    <List component={motion.ul} variants={{ visible: { transition: { staggerChildren: 0.04 }}}} initial="hidden" animate="visible" sx={{ px: 1, flexGrow: 1, overflowY: 'auto' }}>
      {menuItems.map((item) => {
        const hasSubItems = !!item.subItems?.length;
        const hasActiveSubItem = hasSubItems && item.subItems.some(sub => currentPath.startsWith(sub.path));
        const isSelected = currentPath.startsWith(item.path) || hasActiveSubItem;
        const color = menuColors[item.path] || '#2196F3';

        return (
          <React.Fragment key={item.path}>
            <motion.li variants={itemVariants} style={{ listStyle: 'none' }}>
              {hasSubItems ? (
                <StyledListItemButton onClick={() => onSubMenuToggle(item.path)} selected={isSelected} itemcolor={color}>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: isMinimized ? 0 : 2 }}>{item.icon}</ListItemIcon>
                  {!isMinimized && <StyledListItemText primary={item.label} />}
                  {!isMinimized && (openSubMenu[item.path] ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                </StyledListItemButton>
              ) : (
                <Link href={item.path} passHref legacyBehavior>
                  <StyledListItemButton component="a" selected={isSelected} itemcolor={color}>
                    <ListItemIcon sx={{ minWidth: 'auto', mr: isMinimized ? 0 : 2 }}>{item.icon}</ListItemIcon>
                    {!isMinimized && <StyledListItemText primary={item.label} />}
                  </StyledListItemButton>
                </Link>
              )}
            </motion.li>
            {/* ...Lógica del Collapse para los sub-items aquí... */}
          </React.Fragment>
        );
      })}
    </List>
  );
}