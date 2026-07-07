import React, { useEffect, useState } from "react";
import { Api } from "../pages/api/api";
import { Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { styled } from "@mui/system";
import styles from "../styles/Home.module.css";

interface Props {}

interface Tag {
  id: number;
  name: string;
}

interface Problem {
  id: string;
  pro_title: string;
  pro_type: string;
  pro_desc: string;
  pro_image: string;
  lecturerId: number | null;
  sid: string;
  create_at: string;
  tags: Tag[];
}

const StyledTableContainer = styled(TableContainer)`
  margin-top: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: auto;

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const StyledTableCell = styled(TableCell)`
  font-weight: bold;
`;

const TagComponent: React.FC<Props> = () => {
  const [tagData, setTagData] = useState<{ tag: string; problemCount: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lid = localStorage.getItem("rid");
        const response = await Api.get(`/user/problem/?lid=${lid}`);
        const problemData: Problem[] = response.data;

        const tagCount: { [tag: string]: number } = {};
        problemData.forEach((problem) => {
          problem.tags.forEach((tag) => {
            if (tagCount[tag.name]) {
              tagCount[tag.name] += 1;
            } else {
              tagCount[tag.name] = 1;
            }
          });
        });

        const tagList = Object.keys(tagCount)
          .map((tag) => ({
            tag,
            problemCount: tagCount[tag],
          }))
          .sort((a, b) => b.problemCount - a.problemCount)
          .slice(0, 10);

        setTagData(tagList);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  return (
    <StyledTableContainer className={`${styles["styles-table-container"]} ${styles["styles-scrollbar-thumb"]}`}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>อันดับ</StyledTableCell>
            <StyledTableCell>ชื่อ</StyledTableCell>
            <StyledTableCell>จำนวนที่ถูกแท็ก</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tagData.map((tag, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{tag.tag}</TableCell>
              <TableCell>{tag.problemCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default TagComponent;
